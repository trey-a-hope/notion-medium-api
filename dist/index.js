"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const converter_1 = require("./converter");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cors_1.default)());
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
app.post('/convert', async (req, res, next) => {
    try {
        const notionData = req.body;
        if (!notionData || !notionData.blocks) {
            return res.status(400).json({
                error: 'Invalid input: Notion data must contain blocks array'
            });
        }
        const converter = new converter_1.NotionToMediumConverter(notionData);
        const mediumContent = await converter.convert();
        res.status(200).json(mediumContent);
    }
    catch (error) {
        next(error);
    }
});
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
