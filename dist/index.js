"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import required dependencies
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const converter_1 = require("./converter");
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
        // Initialize the converter
        const converter = new converter_1.NotionToMediumHTML();
        // Extract Notion blocks from request body
        const notionData = req.body;
        // Convert Notion blocks to Medium HTML format
        const html = converter.convertToMediumHTML(notionData);
        // Return the converted HTML
        return res.status(200).json(html);
    }
    catch (error) {
        // Log any conversion errors
        console.error('Error during conversion:', error);
        // Return error response with the received body for debugging
        return res.status(500).json({
            error: 'Conversion failed',
            receivedBody: req.body
        });
    }
});
// Start the server and log useful information
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Test the API with:`);
});
