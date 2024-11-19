import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { NotionToMediumConverter } from './converter';
import { NotionExport } from './types';

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
  // console.log('Raw Body:', req.body);
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

    // Sample usage with your JSON
    const notionData = req.body;
    const mediumContent = converter.convertToMedium(notionData);


    return res.status(200).json(mediumContent);

  } catch (error) {
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
interface NotionText {
  type: string;
  text: {
    content: string;
    link: null | string;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
}

interface NotionBlock {
  type: string;
  paragraph?: {
    rich_text: NotionText[];
  };
  heading_1?: {
    rich_text: NotionText[];
  };
  code?: {
    rich_text: NotionText[];
    language: string;
    caption: any[];
  };
}

class NotionToMedium {
  convertToMedium(blocks: NotionBlock[]): string {
    return blocks
      .map(block => this.processBlock(block))
      .filter(Boolean)
      .join('\n\n');
  }

  private processBlock(block: NotionBlock): string {
    switch (block.type) {
      case 'paragraph':
        return this.processParagraph(block.paragraph?.rich_text || []);

      case 'heading_1':
        return this.processHeading(block.heading_1?.rich_text || []);

      case 'code':
        return this.processCode(block.code);

      default:
        return '';
    }
  }

  private processParagraph(richText: NotionText[]): string {
    return richText.map(text => this.formatText(text)).join('');
  }

  private processHeading(richText: NotionText[]): string {
    return `# ${richText.map(text => this.formatText(text)).join('')}`;
  }

  private processCode(code: any): string {
    if (!code?.rich_text?.[0]) return '';
    const content = code.rich_text[0].plain_text;
    const language = code.language || '';
    return `\`\`\`${language}\n${content}\n\`\`\``;
  }

  private formatText(text: NotionText): string {
    let content = text.text.content;

    // Apply formatting based on annotations
    if (text.annotations.bold) {
      content = `**${content}**`;
    }
    if (text.annotations.italic) {
      content = `*${content}*`;
    }
    if (text.annotations.code) {
      content = `\`${content}\``;
    }
    if (text.annotations.strikethrough) {
      content = `~~${content}~~`;
    }

    return content;
  }
}

// Example usage:
const converter = new NotionToMedium();

