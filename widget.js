async function initWinebutlerWidget() {
    try {
        // HTML und CSS laden
        const [html, css] = await Promise.all([
            fetch("widget.html").then(r => r.text()),
            fetch("widget.css").then(r => r.text())
        ]);

        // Host-Element im normalen DOM anlegen
        const host = document.createElement("div");
        host.id = "winebutler-widget-host";
        document.body.appendChild(host);

        // Shadow Root initialisieren
        const shadow = host.attachShadow({ mode: "open" });

        // Inhalt in Shadow DOM schreiben
        shadow.innerHTML = `
      <style>${css}</style>
      <div id="wb-root">
        ${html}
      </div>
    `;

        // Elemente im Shadow DOM holen
        const btn = shadow.getElementById("wb-chat-button");
        const win = shadow.getElementById("wb-chat-window");
        const close = shadow.getElementById("wb-close");

        if (!btn || !win || !close) {
            console.warn("[Winebutler Widget] Elemente nicht gefunden, bitte widget.html pruefen.");
            return;
        }

        // Bubble: open/close toggle
        btn.onclick = () => {
            win.classList.toggle("hidden");
        };

        // X-Button: immer schliessen
        close.onclick = () => {
            win.classList.add("hidden");
        };

    } catch (e) {
        console.error("[Winebutler Widget] Fehler beim Initialisieren:", e);
    }
}

// Sicherstellen, dass DOM vorhanden ist
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWinebutlerWidget);
} else {
    initWinebutlerWidget();
}
