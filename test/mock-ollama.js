const express = require('express');
const app = express();
const PORT = 11435;

app.post('/api/generate', (req, res) => {
    console.log('Mock Ollama received /api/generate request');
    res.setHeader('Content-Type', 'application/x-ndjson');

    const chunks = [
        JSON.stringify({ model: "test", response: "Hello ", done: false }),
        JSON.stringify({ model: "test", response: "<thi", done: false }), // Split start tag
        JSON.stringify({ model: "test", response: "nk> This is a thought process. ", done: false }),
        JSON.stringify({ model: "test", response: "Still thinking... </think>World", done: false }), // Split end logic handled in one go here for simplicity, or split specifically
        JSON.stringify({ model: "test", response: "!", done: true })
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i >= chunks.length) {
            clearInterval(interval);
            res.end();
            return;
        }
        res.write(chunks[i] + '\n');
        i++;
    }, 100);
});

app.listen(PORT, () => {
    console.log(`Mock Ollama listening on port ${PORT}`);
});
