"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import required dependencies
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const { Client } = require('@notionhq/client');
const router = express_1.default.Router();
const notion_to_md_1 = require("notion-to-md");
const notion = new Client({ auth: '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' });
const n2m = new notion_to_md_1.NotionToMarkdown({ notionClient: notion });
// Initialize Express application
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Configure JSON parsing middleware with a 10MB limit
// Store raw body buffer for potential webhook verification
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
    }
}));
// Enable Cross-Origin Resource Sharing (CORS)
app.use((0, cors_1.default)());
// Logging middleware to debug incoming requests
// Logs headers and parsed body for every request
app.use((req, _res, next) => {
    console.log('=== Request Details ===');
    console.log('Headers:', req.headers);
    console.log('Parsed Body:', req.body);
    console.log('====================');
    next();
});
// Configure rate limiting
// Allows 100 requests per 15 minutes window per IP
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
// Apply rate limiting to all routes
app.use(limiter);
// Health check endpoint
// Used for monitoring and infrastructure checks
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});
// Main conversion endpoint
// Accepts Notion blocks and converts them to Medium-compatible HTML
app.post('/convert', async (req, res) => {
    try {
        // // Initialize the converter
        // const converter = new NotionToMediumHTML();
        // // Extract Notion blocks from request body
        // const notionData: NotionBlock[] = req.body;
        // // Convert Notion blocks to Medium HTML format
        // const html = converter.convertToMediumHTML(notionData);
        // const html = await getPage();
        // const ress = await getPage();
        // Return the converted HTML
        // return res.status(200).json(html);
        // const { pageId } = req.params;
        const mdblocks = await n2m.pageToMarkdown('141515c4ebd880bdb52ccc888df6d202');
        const mdString = n2m.toMarkdownString(mdblocks);
        res.status(200).send(mdString);
    }
    catch (error) {
        // Log any conversion errors
        console.error('Error during conversion:', error);
        // Return error response with the received body for debugging
        return res.status(500).json({
            error: error,
            receivedBody: req.body
        });
    }
});
// Start the server and log useful information
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test the API with:`);
});
const convertBlockToHtml = (block) => {
    switch (block.type) {
        case 'paragraph':
            return block.paragraph ? `<p>${block.paragraph.rich_text.map(text => text.plain_text).join('')}</p>` : '';
        case 'heading_1':
            return block.heading_1 ? `<h1>${block.heading_1.rich_text.map(text => text.plain_text).join('')}</h1>` : '';
        case 'heading_2':
            return block.heading_2 ? `<h2>${block.heading_2.rich_text.map(text => text.plain_text).join('')}</h2>` : '';
        case 'heading_3':
            return block.heading_3 ? `<h3>${block.heading_3.rich_text.map(text => text.plain_text).join('')}</h3>` : '';
        case 'bulleted_list_item':
            return block.bulleted_list_item ? `<li>${block.bulleted_list_item.rich_text.map(text => text.plain_text).join('')}</li>` : '';
        case 'numbered_list_item':
            return block.numbered_list_item ? `<li>${block.numbered_list_item.rich_text.map(text => text.plain_text).join('')}</li>` : '';
        case 'to_do':
            if (!block.to_do)
                return '';
            const checked = block.to_do.checked ? 'checked' : '';
            return `<div class="todo-item">
        <input type="checkbox" ${checked} disabled>
        <span>${block.to_do.rich_text.map(text => text.plain_text).join('')}</span>
      </div>`;
        case 'code':
            if (!block.code)
                return '';
            return `<pre><code class="language-${block.code.language}">${block.code.rich_text.map(text => text.plain_text).join('')}</code></pre>`;
        case 'image':
            if (!block.image)
                return '';
            const url = block.image.type === 'external' ? block.image?.external?.url : block.image?.file?.url;
            return url ? `<img src="${url}" alt="Notion image" />` : '';
        default:
            return '';
    }
};
