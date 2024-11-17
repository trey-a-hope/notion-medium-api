import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { NotionToMediumConverter } from './converter';
import { errorHandler } from './middleware/errorHandler';
import { NotionExport } from './types';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.post('/convert', async (req, res, next) => {
  try {
    const notionData = req.body as NotionExport;

    if (!notionData || !notionData.blocks) {
      return res.status(400).json({
        error: 'Invalid input: Notion data must contain blocks array'
      });
    }

    const converter = new NotionToMediumConverter(notionData);
    const mediumContent = await converter.convert();

    res.status(200).json(mediumContent);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});