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
    // console.log('Processing request...');

    // // Validate request body
    // if (!req.body) {
    //   console.log('No request body found');
    //   return res.status(400).json({
    //     error: 'Missing request body'
    //   });
    // }

    // // Log the received data
    // console.log('Received body:', JSON.stringify(req.body, null, 2));

    // // Validate blocks array
    // if (!req.body.blocks || !Array.isArray(req.body.blocks)) {
    //   console.log('Invalid blocks array');
    //   return res.status(400).json({
    //     error: 'Invalid input',
    //     message: 'Request must contain a blocks array',
    //     received: req.body
    //   });
    // }

    // // Create converter
    // console.log('Creating converter...');
    // const converter = new NotionToMediumConverter(req.body);

    // // Convert content
    // console.log('Converting content...');
    // const mediumContent = await converter.convert();

    // console.log('Conversion successful');
    // console.log('Result:', JSON.stringify(mediumContent, null, 2));

    // Usage example:
    const json: Block[] = req.body;
    const markdown = convertNotionToMarkdown(json);


    return res.status(200).json(req.body);

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


interface RichText {
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
  href: null | string;
}

interface Block {
  object: string;
  id: string;
  type: string;
  paragraph?: {
    rich_text: RichText[];
  };
  heading_1?: {
    rich_text: RichText[];
  };
  code?: {
    rich_text: RichText[];
    language: string;
  };
}

const convertNotionToMarkdown = (blocks: Block[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case 'paragraph': {
        if (!block.paragraph) return '';
        const text = block.paragraph.rich_text.map(t => {
          const content = t.plain_text;
          return t.annotations.bold ? `**${content}**` : content;
        }).join('');
        return text;
      }
      case 'heading_1': {
        if (!block.heading_1) return '';
        const text = block.heading_1.rich_text[0].plain_text;
        return `# ${text}`;
      }
      case 'code': {
        if (!block.code) return '';
        const code = block.code.rich_text[0].plain_text;
        const lang = block.code.language;
        return `\`\`\`${lang}\n${code}\n\`\`\``;
      }
      default:
        return '';
    }
  }).filter(Boolean).join('\n\n');
};

