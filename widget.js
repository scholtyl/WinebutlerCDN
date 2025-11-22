async function initWinebutlerWidget() {
    try {
        const CDN = "https://scholtyl.github.io/WinebutlerCDN/";

        // Load HTML & CSS from CDN
        const [html, css] = await Promise.all([
            fetch(CDN + "widget.html").then(r => r.text()),
            fetch(CDN + "widget.css").then(r => r.text())
        ]);

        // Create host element in partner site
        const host = document.createElement("div");
        host.id = "winebutler-widget-host";
        document.body.appendChild(host);

        // Create and attach shadow
        const shadow = host.attachShadow({mode: "open"});
        shadow.innerHTML = `
          <style>${css}</style>
          <div id="wb-root">
            ${html}
          </div>
        `;

        const btn = shadow.getElementById("wb-chat-button");
        const win = shadow.getElementById("wb-chat-window");
        const close = shadow.getElementById("wb-close");
        const messages = shadow.querySelector(".wb-messages");
        const input = shadow.querySelector(".wb-input input");
        const sendBtn = shadow.querySelector(".wb-input button");

        if (!btn || !win || !close || !messages || !input || !sendBtn) {
            console.warn("[Winebutler Widget] Did not find all needed elements.");
            return;
        }

        // Bubble: open/close toggle
        btn.onclick = () => {
            win.classList.toggle("hidden");
        };

        // X-Button: close
        close.onclick = () => {
            win.classList.add("hidden");
        };

        const appendMessage = (text, author = "bot") => {
            const div = document.createElement("div");
            div.className = author === "user" ? "msg-user" : "msg-bot";
            div.textContent = text;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
            return div;
        };

        const getKontextWineName = () => {
            const wineNameElement = document.getElementById("wb-WineName");
            return wineNameElement ? wineNameElement.textContent.trim() : null;
        };

        const setInputDisabled = (state) => {
            input.disabled = state;
            sendBtn.disabled = state;
            if (!state) {
                input.focus();
            }
        };

        const sendMessage = async () => {
            const text = input.value.trim();
            if (!text) {
                return;
            }

            input.value = "";
            appendMessage(text, "user");
            setInputDisabled(true);

            const pendingMessage = appendMessage("Der Winebutler denkt nach …", "bot");

            try {
                const response = await fetch("http://localhost:8080/api/v1/widget", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userQuestion: text,
                        context: getKontextWineName() || undefined
                    })
                });

                if (!response.ok) {
                    throw new Error(`Status ${response.status}`);
                }

                const data = await response.json().catch(() => null);
                const reply = data?.reply || data?.chatAnswer || "Something went wrong";
                pendingMessage.textContent = reply;
            } catch (err) {
                console.error("[Winebutler Widget] Backend-Fehler:", err);
                pendingMessage.textContent = "Entschuldigung, der Keller ist gerade nicht erreichbar. Bitte versuche es später erneut.";
            } finally {
                setInputDisabled(false);
            }
        };

        sendBtn.addEventListener("click", sendMessage);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });

    } catch (e) {
        console.error("[Winebutler Widget] Error initializing:", e);
    }
}

// Load once dom is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWinebutlerWidget);
} else {
    initWinebutlerWidget();
}
