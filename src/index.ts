import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: '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' });

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(cors());


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



app.post('/convert', async (req, res) => {
  try {
    const pageId = req.body.pageId;

    // const html = await getNestedBlocks('141515c4ebd880bdb52ccc888df6d202');
    // res.status(200).send(html);
    res.status(200).send(pageId);
  } catch (error) {
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


