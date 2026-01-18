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
