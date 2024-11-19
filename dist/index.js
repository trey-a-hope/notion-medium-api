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
        // const notionData = req.body;
        // const mediumHtml = converter.convertToMediumHTML(notionData);
        const converter = new converter_1.NotionToMediumHTML();
        const notionData = req.body;
        const html = converter.convertToMediumHTML(notionData);
        return res.status(200).json(html);
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
// TODO Remove this app.listen.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test the API with:`);
    //   console.log(`
    // curl -X POST http://localhost:${port}/convert \\
    //   -H "Content-Type: application/json" \\
    //   -d '{"blocks":[{"type":"header","properties":{"title":[["Test Title"]]}}]}'
    //   `);
});
