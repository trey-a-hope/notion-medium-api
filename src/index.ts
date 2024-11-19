import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { NotionBlock } from './types';
import { NotionToMediumHTML } from './converter';

const app = express();
const port = process.env.PORT || 3000;

// Add raw body logging
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(cors());

// Add request logging middleware
app.use((req, _res, next) => {
  console.log('=== Request Details ===');
  console.log('Headers:', req.headers);
  console.log('Parsed Body:', req.body);
  console.log('====================');
  next();
});

const limiter = rateLimit({
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
    const converter = new NotionToMediumHTML();
    const notionData: NotionBlock[] = req.body;
    const html = converter.convertToMediumHTML(notionData);

    return res.status(200).json(html);
  } catch (error) {
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
