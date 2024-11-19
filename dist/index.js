"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Add raw body logging
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use((0, cors_1.default)());
// Add request logging middleware
app.use((req, _res, next) => {
    console.log('=== Request Details ===');
    console.log('Headers:', req.headers);
    // console.log('Raw Body:', req.body);
    console.log('Parsed Body:', req.body);
    console.log('====================');
    next();
});
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});
app.post('/convert', async (req, res) => {
    try {
        // Sample usage with your JSON
        const notionData = req.body;
        const mediumHtml = converter.convertToMediumHTML(notionData);
        return res.status(200).json(mediumHtml);
    }
    catch (error) {
        console.error('Error during conversion:', error);
        return res.status(500).json({
            error: 'Conversion failed',
            // message: error.message,
            receivedBody: req.body
        });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test the API with:`);
    console.log(`
curl -X POST http://localhost:${port}/convert \\
  -H "Content-Type: application/json" \\
  -d '{"blocks":[{"type":"header","properties":{"title":[["Test Title"]]}}]}'
  `);
});
class NotionToMediumHTML {
    convertToMediumHTML(blocks) {
        const article = blocks
            .map(block => this.processBlock(block))
            .filter(Boolean)
            .join('\n\n');
        return `${article}`;
    }
    processBlock(block) {
        switch (block.type) {
            case 'paragraph':
                return `<p>${this.processParagraph(block.paragraph?.rich_text || [])}</p>`;
            case 'heading_1':
                return `<h1>${this.processText(block.heading_1?.rich_text || [])}</h1>`;
            case 'code':
                return this.processCode(block.code);
            default:
                return '';
        }
    }
    processParagraph(richText) {
        return richText.map(text => this.formatText(text)).join('');
    }
    processText(richText) {
        return richText.map(text => text.plain_text).join('');
    }
    processCode(code) {
        if (!code?.rich_text?.[0])
            return '';
        const content = code.rich_text[0].plain_text;
        const language = code.language || '';
        return `<pre data-language="${language}"><code>${this.escapeHtml(content)}</code></pre>`;
    }
    formatText(text) {
        let content = this.escapeHtml(text.text.content);
        // Apply HTML formatting based on annotations
        if (text.annotations.bold) {
            content = `<strong>${content}</strong>`;
        }
        if (text.annotations.italic) {
            content = `<em>${content}</em>`;
        }
        if (text.annotations.code) {
            content = `<code>${content}</code>`;
        }
        if (text.annotations.strikethrough) {
            content = `<del>${content}</del>`;
        }
        if (text.annotations.underline) {
            content = `<u>${content}</u>`;
        }
        return content;
    }
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
// Example usage:
const converter = new NotionToMediumHTML();
