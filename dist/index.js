"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const converter_1 = require("./converter");
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
        console.log('Processing request...');
        // Validate request body
        if (!req.body) {
            console.log('No request body found');
            return res.status(400).json({
                error: 'Missing request body'
            });
        }
        // Log the received data
        console.log('Received body:', JSON.stringify(req.body, null, 2));
        // Validate blocks array
        if (!req.body.blocks || !Array.isArray(req.body.blocks)) {
            console.log('Invalid blocks array');
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Request must contain a blocks array',
                received: req.body
            });
        }
        // Create converter
        console.log('Creating converter...');
        const converter = new converter_1.NotionToMediumConverter(req.body);
        // Convert content
        // console.log('Converting content...');
        // const mediumContent = await converter.convert();
        // console.log('Conversion successful');
        // console.log('Result:', JSON.stringify(mediumContent, null, 2));
        // return res.status(200).json(mediumContent);
        const mdblocks = await n2m.pageToMarkdown("target_page_id");
        const mdString = n2m.toMarkdownString(mdblocks);
        return res.status(200).json(mdString);
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
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require('fs');
// or
// import {NotionToMarkdown} from "notion-to-md";
const notion = new Client({
    auth: "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",
});
// passing notion client to the option
const n2m = new NotionToMarkdown({
    notionClient: notion,
    config: {
        separateChildPage: true, // default: false
    }
});
