"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: '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' });
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use((0, cors_1.default)());
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
app.post('/convert', async (req, res) => {
    try {
        const pageId = req.body.pageId;
        // const html = await getNestedBlocks('141515c4ebd880bdb52ccc888df6d202');
        // res.status(200).send(html);
        res.status(200).send(pageId);
    }
    catch (error) {
        console.error('Error during conversion:', error);
        return res.status(500).json({
            error: error,
            receivedBody: req.body
        });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test the API with:`);
});
