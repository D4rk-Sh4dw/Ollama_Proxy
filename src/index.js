const express = require('express');
const axios = require('axios');
const OllamaFilterStream = require('./stream-transformer');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

console.log(`Starting Ollama Proxy...`);
console.log(`Target Ollama URL: ${OLLAMA_URL}`);

// Middleware to handle proxying
app.use('/', async (req, res) => {
    const targetUrl = `${OLLAMA_URL}${req.originalUrl}`;

    console.log(`Proxying ${req.method} ${req.originalUrl} to ${targetUrl}`);

    try {
        // Prepare headers
        // We shouldn't pass host header, axios handles it.
        const headers = { ...req.headers };
        delete headers['host']; // Let axios set the host
        delete headers['content-length']; // We are streaming, let axios manage it

        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: headers,
            data: req, // Pipe the request body directly
            responseType: 'stream', // Important for streaming responses
            validateStatus: () => true, // Accept all status codes
        });

        // Set response headers
        // Copy headers from Ollama response to our response
        Object.keys(response.headers).forEach(key => {
            if (key !== 'content-length') { // Strip content-length as we might modify body
                res.setHeader(key, response.headers[key]);
            }
        });

        res.status(response.status);

        // Check if we should filter
        const isGenerateOrChat = req.path === '/api/generate' || req.path === '/api/chat';

        // We only filter if it's a JSON/NDJSON stream (usually generic application/json implies it too for Ollama)
        // But the robust check is URL.
        if (isGenerateOrChat) {
            console.log('Attaching ThinkFilter to response stream.');
            const filter = new OllamaFilterStream();

            response.data.pipe(filter).pipe(res);

            filter.on('error', (err) => {
                console.error('Filter stream error:', err);
                res.end();
            });
        } else {
            // Pipe directly for other endpoints
            response.data.pipe(res);
        }

    } catch (error) {
        console.error('Proxy error:', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Proxy error', details: error.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Ollama Proxy listening on port ${PORT}`);
});
