# Ollama Proxy - No-Think

A lightweight Node.js proxy for Ollama that filters out "thinking" blocks (`<think>...</think>`) from streaming responses. Useful for using reasoning models (like DeepSeek-R1) with clients that don't support or want to see the reasoning trace.

## Prerequisites

- [Node.js](https://nodejs.org/) (Version 16 or higher)
- [Ollama](https://ollama.com/) installed and running

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/D4rk-Sh4dw/Ollama_Proxy.git
    cd Ollama_Proxy
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

1.  Start the proxy:
    ```bash
    npm start
    ```
    The server will start on port **3000** by default.

2.  Configure your AI client (VS Code, WebUI, etc.) to use the proxy URL:
    -   **Base URL:** `http://localhost:3000` (instead of `http://localhost:11434`)

    Example Request:
    ```bash
    curl http://localhost:3000/api/generate -d '{
      "model": "deepseek-r1:8b",
      "prompt": "Why is the sky blue?"
    }'
    ```

## Configuration

You can configure the proxy using environment variables:

-   `PORT`: The port the proxy listens on (default: `3000`)
-   `OLLAMA_URL`: The URL of your backend Ollama instance (default: `http://127.0.0.1:11434`)

Example (PowerShell):
```powershell
$env:PORT=4000
$env:OLLAMA_URL="http://192.168.1.100:11434"
npm start
```

## Run as Service (Ubuntu/Linux)

1.  **Modify the service file:**
    Edit `ollama-proxy.service` and check the paths:
    -   `WorkingDirectory`: Set this to where you cloned the repo (e.g., `/opt/Ollama_Proxy`).
    -   `ExecStart`: Ensure the path to `npm` is correct (run `which npm` to find it).

2.  **Copy to systemd directory:**
    ```bash
    sudo cp ollama-proxy.service /etc/systemd/system/
    ```

3.  **Enable and Start:**
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable ollama-proxy
    sudo systemctl start ollama-proxy
    ```

4.  **Check Status:**
    ```bash
    sudo systemctl status ollama-proxy
    ```

## How it works

The proxy intercepts streaming responses (NDJSON) from Ollama. It buffers the text chunks and strips out any content enclosed within `<think>` and `</think>` tags before forwarding the clean stream to the client. Non-streaming requests or other endpoints are forwarded transparently.

---

# Deutsche Anleitung

Ein leichtgewichtiger Proxy für Ollama, der "Thinking"-Blöcke (`<think>...</think>`) aus Streaming-Antworten entfernt. Nützlich für Reasoning-Modelle (wie DeepSeek-R1), wenn der Client den Denkprozess nicht unterstützt oder nicht anzeigen soll.

## Installation

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/D4rk-Sh4dw/Ollama_Proxy.git
    cd Ollama_Proxy
    ```

2.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

## Nutzung

1.  **Starten:**
    ```bash
    npm start
    ```
    Der Server läuft standardmäßig auf Port **3000**.

2.  **Client konfigurieren:**
    Ändere die Ollama-Basis-URL in deinem Client anstatt `http://localhost:11434` auf:
    *   **URL:** `http://localhost:3000`

## Als Service einrichten (Ubuntu/Linux)

1.  **Service-Datei anpassen:**
    Bearbeite `ollama-proxy.service` und prüfe die Pfade:
    -   `WorkingDirectory`: Pfad zum geklonten Repo (z.B. `/opt/Ollama_Proxy`).
    -   `ExecStart`: Pfad zu `npm` (nutze `which npm` um ihn zu finden).

2.  **Kopieren:**
    ```bash
    sudo cp ollama-proxy.service /etc/systemd/system/
    ```

3.  **Aktivieren und Starten:**
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable ollama-proxy
    sudo systemctl start ollama-proxy
    ```

4.  **Status prüfen:**
    ```bash
    sudo systemctl status ollama-proxy
    ```
