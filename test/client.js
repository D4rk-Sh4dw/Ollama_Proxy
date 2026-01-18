const axios = require('axios');

async function runTest() {
    try {
        console.log('Sending request to proxy...');
        const response = await axios({
            method: 'post',
            url: 'http://localhost:3000/api/generate',
            data: { model: 'test' },
            responseType: 'stream'
        });

        let fullText = '';
        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        fullText += json.response;
                    }
                } catch (e) {
                    console.error('Error parsing line:', line);
                }
            }
        });

        response.data.on('end', () => {
            console.log('Final Output:', fullText);
            if (fullText === 'Hello World!') {
                console.log('TEST PASSED: Thinking removed correctly.');
            } else {
                console.log('TEST FAILED: Unexpected output.');
                console.log('Expected: "Hello World!"');
                console.log('Actual:   "' + fullText + '"');
            }
        });

    } catch (error) {
        console.error('Test failed with error:', error.message);
    }
}

// Wait for servers to start
setTimeout(runTest, 2000);
