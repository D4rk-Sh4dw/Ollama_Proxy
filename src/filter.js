
class ThinkFilter {
    constructor() {
        this.inThink = false;
        this.buffer = ''; // Stores potentially partial tags
    }

    /**
     * Processes a chunk of text and returns the text with <think>...</think> removed.
     * Preserves state across calls.
     * @param {string} input 
     * @returns {string}
     */
    process(input) {
        let text = this.buffer + input;
        this.buffer = ''; // Clear buffer, we will rebuild it if needed
        let output = '';

        while (text.length > 0) {
            if (this.inThink) {
                // We are inside a <think> block, looking for </think>
                const endTagIndex = text.indexOf('</think>');
                if (endTagIndex !== -1) {
                    // Found the closing tag
                    this.inThink = false;
                    // Skip the tag and continue processing the rest
                    text = text.substring(endTagIndex + 8); // 8 is length of </think>
                } else {
                    // Did not find closing tag.
                    // Check if the end of the string could be the start of </think>
                    // </think> length is 8.
                    // match a tail of text to a prefix of </think>
                    const tailCheck = this.findPartialMatch(text, '</think>');
                    if (tailCheck > 0) {
                        this.buffer = text.slice(-tailCheck);
                        // Discard the rest of the text as it is inside the think block
                        text = '';
                    } else {
                        // The whole text is inside the think block and no partial closing tag found
                        text = '';
                    }
                }
            } else {
                // We are NOT in a think block, looking for <think>
                const startTagIndex = text.indexOf('<think>');
                if (startTagIndex !== -1) {
                    // Found start tag
                    // Output everything before it
                    output += text.substring(0, startTagIndex);
                    this.inThink = true;
                    // Skip the tag and continue
                    text = text.substring(startTagIndex + 7); // 7 is length of <think>
                } else {
                    // No start tag found.
                    // Check if the end could be a partial <think>
                    const tailCheck = this.findPartialMatch(text, '<think>');
                    if (tailCheck > 0) {
                        // Output everything up to the partial match
                        output += text.slice(0, -tailCheck);
                        this.buffer = text.slice(-tailCheck);
                        text = '';
                    } else {
                        // Just regular text
                        output += text;
                        text = '';
                    }
                }
            }
        }

        return output;
    }

    /**
     * Checks if the end of 'text' matches the start of 'tag'.
     * Returns the length of the match.
     */
    findPartialMatch(text, tag) {
        // Max possible overlap is tag.length - 1
        // We iterate from largest possible overlap down to 1
        const maxOverlap = Math.min(text.length, tag.length - 1);
        for (let i = maxOverlap; i > 0; i--) {
            if (text.endsWith(tag.substring(0, i))) {
                return i;
            }
        }
        return 0;
    }
}

module.exports = ThinkFilter;
