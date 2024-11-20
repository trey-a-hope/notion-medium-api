// Import required dependencies
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
// import { NotionBlock } from './types';
import { NotionToMediumHTML } from './converter';
const { Client } = require('@notionhq/client');
const router = express.Router();

const notion = new Client({ auth: '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' });


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
    // // Initialize the converter
    // const converter = new NotionToMediumHTML();

    // // Extract Notion blocks from request body
    // const notionData: NotionBlock[] = req.body;

    // // Convert Notion blocks to Medium HTML format
    // const html = converter.convertToMediumHTML(notionData);

    // const html = await getPage();
    // const ress = await getPage();

    // Return the converted HTML
    // return res.status(200).json(html);
    // const { pageId } = req.params;
    const blocks = await notion.blocks.children.list({ block_id: '4d64bbc0634d4758befa85c5a3a6c22f' });

    let html = '';
    let inBulletedList = false;
    let inNumberedList = false;

    for (const block of blocks.results) {
      if (block.type === 'bulleted_list_item') {
        if (!inBulletedList) {
          html += '<ul>';
          inBulletedList = true;
        }
      } else if (block.type === 'numbered_list_item') {
        if (!inNumberedList) {
          html += '<ol>';
          inNumberedList = true;
        }
      } else {
        if (inBulletedList) {
          html += '</ul>';
          inBulletedList = false;
        }
        if (inNumberedList) {
          html += '</ol>';
          inNumberedList = false;
        }
      }

      html += convertBlockToHtml(block);
    }

    if (inBulletedList) html += '</ul>';
    if (inNumberedList) html += '</ol>';

    res.status(200).send(html);
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

interface NotionBlock {
  type: string;
  paragraph?: {
    rich_text: RichText[];
  };
  heading_1?: {
    rich_text: RichText[];
  };
  heading_2?: {
    rich_text: RichText[];
  };
  heading_3?: {
    rich_text: RichText[];
  };
  bulleted_list_item?: {
    rich_text: RichText[];
  };
  numbered_list_item?: {
    rich_text: RichText[];
  };
  to_do?: {
    rich_text: RichText[];
    checked: boolean;
  };
  code?: {
    rich_text: RichText[];
    language: string;
  };
  image?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
  };
}

interface RichText {
  plain_text: string;
}

const convertBlockToHtml = (block: NotionBlock): string => {
  switch (block.type) {
    case 'paragraph':
      return block.paragraph ? `<p>${block.paragraph.rich_text.map(text => text.plain_text).join('')}</p>` : '';
    case 'heading_1':
      return block.heading_1 ? `<h1>${block.heading_1.rich_text.map(text => text.plain_text).join('')}</h1>` : '';
    case 'heading_2':
      return block.heading_2 ? `<h2>${block.heading_2.rich_text.map(text => text.plain_text).join('')}</h2>` : '';
    case 'heading_3':
      return block.heading_3 ? `<h3>${block.heading_3.rich_text.map(text => text.plain_text).join('')}</h3>` : '';
    case 'bulleted_list_item':
      return block.bulleted_list_item ? `<li>${block.bulleted_list_item.rich_text.map(text => text.plain_text).join('')}</li>` : '';
    case 'numbered_list_item':
      return block.numbered_list_item ? `<li>${block.numbered_list_item.rich_text.map(text => text.plain_text).join('')}</li>` : '';
    case 'to_do':
      if (!block.to_do) return '';
      const checked = block.to_do.checked ? 'checked' : '';
      return `<div class="todo-item">
        <input type="checkbox" ${checked} disabled>
        <span>${block.to_do.rich_text.map(text => text.plain_text).join('')}</span>
      </div>`;
    case 'code':
      if (!block.code) return '';
      return `<pre><code class="language-${block.code.language}">${block.code.rich_text.map(text => text.plain_text).join('')
        }</code></pre>`;
    case 'image':
      if (!block.image) return '';
      const url = block.image.type === 'external' ? block.image?.external?.url : block.image?.file?.url;
      return url ? `<img src="${url}" alt="Notion image" />` : '';
    default:
      return '';
  }
};