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
        const html = await getNestedBlocks('141515c4ebd880bdb52ccc888df6d202');
        res.status(200).send(html);
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
// Handle rich text to HTML, including styling
const richTextToHtml = (richText) => {
    return richText.map(text => {
        let content = text.plain_text;
        // Apply text styling
        if (text.annotations.bold)
            content = `<strong>${content}</strong>`;
        if (text.annotations.italic)
            content = `<em>${content}</em>`;
        if (text.annotations.strikethrough)
            content = `<del>${content}</del>`;
        if (text.annotations.underline)
            content = `<u>${content}</u>`;
        if (text.annotations.code)
            content = `<code>${content}</code>`;
        // Handle links
        if (text.href)
            content = `<a href="${text.href}">${content}</a>`;
        return content;
    }).join('');
};
const convertBlock = (block) => {
    switch (block.type) {
        case 'paragraph':
            return `<p>${richTextToHtml(block.paragraph.rich_text)}</p>`;
        case 'heading_1':
            return `<h1>${richTextToHtml(block.heading_1.rich_text)}</h1>`;
        case 'heading_2':
            return `<h2>${richTextToHtml(block.heading_2.rich_text)}</h2>`;
        case 'heading_3':
            return `<h3>${richTextToHtml(block.heading_3.rich_text)}</h3>`;
        case 'bulleted_list_item':
            return `<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`;
        case 'numbered_list_item':
            return `<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`;
        case 'code':
            return `<pre><code class="language-${block.code.language}">${richTextToHtml(block.code.rich_text)}</code></pre>`;
        case 'quote':
            return `<blockquote>${richTextToHtml(block.quote.rich_text)}</blockquote>`;
        case 'callout':
            return `<div class="callout">
        ${block.callout.icon?.emoji || ''}
        ${richTextToHtml(block.callout.rich_text)}
      </div>`;
        case 'image':
            const imgUrl = block.image.type === 'external' ?
                block.image.external.url :
                block.image.file.url;
            const caption = block.image.caption ?
                richTextToHtml(block.image.caption) :
                'Notion image';
            return `<figure>
        <img src="${imgUrl}" alt="${caption}" />
        ${block.image.caption ? `<figcaption>${caption}</figcaption>` : ''}
      </figure>`;
        case 'video':
            const videoUrl = block.video.type === 'external' ?
                block.video.external.url :
                block.video.file.url;
            return `<video src="${videoUrl}" controls></video>`;
        case 'divider':
            return '<hr>';
        case 'table':
            return '<div class="table-wrapper">Table content</div>';
        case 'column_list':
            return '<div class="columns">Column content</div>';
        default:
            return '';
    }
};
const getNestedBlocks = async (blockId) => {
    try {
        const { results } = await notion.blocks.children.list({ block_id: blockId });
        let html = '';
        let inBulletedList = false;
        let inNumberedList = false;
        for (const block of results) {
            // Handle nested blocks recursively
            if (block.has_children) {
                const childContent = await getNestedBlocks(block.id);
                // Attach child content to parent block appropriately
                switch (block.type) {
                    case 'toggle':
                        html += `<details>
              <summary>${richTextToHtml(block[block.type].rich_text)}</summary>
              ${childContent}
            </details>`;
                        continue;
                    case 'column_list':
                        html += `<div class="columns">${childContent}</div>`;
                        continue;
                    default:
                        // For other block types, append child content after the block
                        html += convertBlock(block) + childContent;
                        continue;
                }
            }
            // Handle lists
            if (block.type === 'bulleted_list_item') {
                if (!inBulletedList) {
                    html += '<ul>';
                    inBulletedList = true;
                }
            }
            else if (block.type === 'numbered_list_item') {
                if (!inNumberedList) {
                    html += '<ol>';
                    inNumberedList = true;
                }
            }
            else {
                if (inBulletedList) {
                    html += '</ul>';
                    inBulletedList = false;
                }
                if (inNumberedList) {
                    html += '</ol>';
                    inNumberedList = false;
                }
            }
            html += convertBlock(block);
        }
        // Close any open lists
        if (inBulletedList)
            html += '</ul>';
        if (inNumberedList)
            html += '</ol>';
        return html;
    }
    catch (error) {
        console.error('Error fetching nested blocks:', error);
        return '';
    }
};
