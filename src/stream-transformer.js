const { Transform } = require('stream');
const ThinkFilter = require('./filter');

class OllamaFilterStream extends Transform {
    constructor() {
        super();
        this.filter = new ThinkFilter();
        this.buffer = '';
    }

    _transform(chunk, encoding, callback) {
        // Append new chunk to buffer
        this.buffer += chunk.toString();

        // Split by newline
        const lines = this.buffer.split('\n');

        // The last element is either an empty string (if buffer ended with \n)
        // or an incomplete line. We keep it in the buffer.
        this.buffer = lines.pop();

        for (const line of lines) {
            if (!line.trim()) continue; // Skip empty lines

            try {
                const json = JSON.parse(line);
                let content = '';
                let fieldToUpdate = null;

                // Identify the field containing the text
                if (json.response !== undefined) {
                    content = json.response;
                    fieldToUpdate = 'response';
                } else if (json.message && json.message.content !== undefined) {
                    content = json.message.content;
                    fieldToUpdate = 'message.content';
                }

                if (fieldToUpdate) {
                    // Filter the content
                    const cleanContent = this.filter.process(content);

                    // Update the JSON
                    if (fieldToUpdate === 'response') {
                        json.response = cleanContent;
                    } else {
                        json.message.content = cleanContent;
                    }
                }

                // Push the modified line
                this.push(JSON.stringify(json) + '\n');

            } catch (e) {
                console.error('Error parsing JSON line:', e);
                // In case of error, just push the original line? 
                // Or maybe the line was actually not JSON but some error message.
                // Best to push it through to avoid breaking the stream completely, 
                // though it might be corrupt if we're in the middle of a think block.
                this.push(line + '\n');
            }
        }

        callback();
    }

    _flush(callback) {
        // Process any remaining buffer
        if (this.buffer.trim()) {
            try {
                const json = JSON.parse(this.buffer);
                // Apply logic same as above (refactor if needed, but for now duplicate for simplicity)
                let content = '';
                let fieldToUpdate = null;

                if (json.response !== undefined) {
                    content = json.response;
                    fieldToUpdate = 'response';
                } else if (json.message && json.message.content !== undefined) {
                    content = json.message.content;
                    fieldToUpdate = 'message.content';
                }

                if (fieldToUpdate) {
                    const cleanContent = this.filter.process(content);
                    if (fieldToUpdate === 'response') {
                        json.response = cleanContent;
                    } else {
                        json.message.content = cleanContent;
                    }
                }
                this.push(JSON.stringify(json) + '\n');
            } catch (e) {
                this.push(this.buffer);
            }
        }
        callback();
    }
}

module.exports = OllamaFilterStream;
