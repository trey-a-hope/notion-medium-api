// Import required dependencies
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { NotionBlock } from './types';
import { NotionToMediumHTML } from './converter';

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000;

// Configure JSON parsing middleware with a 10MB limit
// Store raw body buffer for potential webhook verification
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

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
const limiter = rateLimit({
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
    const converter = new NotionToMediumHTML();
    
    // Extract Notion blocks from request body
    const notionData: NotionBlock[] = req.body;
    
    // Convert Notion blocks to Medium HTML format
    const html = converter.convertToMediumHTML(notionData);

    // Return the converted HTML
    return res.status(200).json(html);
  } catch (error) {
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