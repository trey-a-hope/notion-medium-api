import express from 'express';
import cors from 'cors';
const { Client } = require('@notionhq/client');
// Initialize Notion client with API key
const notion = new Client({ auth: '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' });

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for cross-origin requests
app.use(cors());

// Configure JSON parsing middleware with 10mb limit
// Store raw body for potential webhook verification
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Debugging middleware to log request details
app.use((req, _res, next) => {
  console.log('=== Request Details ===');
  console.log('Headers:', req.headers);
  console.log('Parsed Body:', req.body);
  console.log('====================');
  next();
});

// Start server and log connection details
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Test the API with:`);
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

/**
 * Convert Notion page to HTML endpoint
 * Expects request body with { pageId: string }
 */
app.post('/convert', async (req, res) => {
  try {
    const pageId = req.body.pageId;
    const html = await getNestedBlocks(`${pageId}`);
    res.status(200).send(html);
  } catch (error) {
    console.error('Error during conversion:', error);
    return res.status(500).json({
      error: error,
      receivedBody: req.body
    });
  }
});

/**
 * Converts Notion's rich text array to HTML
 * Handles formatting like bold, italic, strike-through, etc.
 * @param richText - Array of Notion rich text objects
 * @returns HTML string with appropriate formatting tags
 */
const richTextToHtml = (richText: any[]): string => {
  return richText.map(text => {
    let content = text.plain_text;

    // Apply text formatting annotations
    if (text.annotations.bold) content = `<strong>${content}</strong>`;
    if (text.annotations.italic) content = `<em>${content}</em>`;
    if (text.annotations.strikethrough) content = `<del>${content}</del>`;
    if (text.annotations.underline) content = `<u>${content}</u>`;
    if (text.annotations.code) content = `<code>${content}</code>`;

    // Handle links
    if (text.href) content = `<a href="${text.href}">${content}</a>`;

    return content;
  }).join('');
};

/**
 * Converts a single Notion block to its HTML equivalent
 * @param block - Notion block object
 * @returns HTML string representation of the block
 */
const convertBlock = (block: any): string => {
  switch (block.type) {
    case 'paragraph':
      return `<p>${richTextToHtml(block.paragraph.rich_text)}</p>`;

    case 'heading_1':
      return `<h1>${richTextToHtml(block.heading_1.rich_text)}</h1>`;

    case 'heading_2':
      return `<h2>${richTextToHtml(block.heading_2.rich_text)}</h2>`;

    case 'heading_3':
      return `<h3>${richTextToHtml(block.heading_3.rich_text)}</h3>`;

    case 'bulleted_list_item':
      return `<li>${richTextToHtml(block.bulleted_list_item.rich_text)}</li>`;

    case 'numbered_list_item':
      return `<li>${richTextToHtml(block.numbered_list_item.rich_text)}</li>`;

    case 'code':
      return `<pre><code class="language-${block.code.language}">${richTextToHtml(block.code.rich_text)
        }</code></pre>`;

    case 'quote':
      return `<blockquote>${richTextToHtml(block.quote.rich_text)}</blockquote>`;

    case 'callout':
      return `<div class="callout">
        ${block.callout.icon?.emoji || ''}
        ${richTextToHtml(block.callout.rich_text)}
      </div>`;

    case 'image':
      // Handle both external and internal images
      const imgUrl = block.image.type === 'external' ?
        block.image.external.url :
        block.image.file.url;
      const caption = block.image.caption ?
        richTextToHtml(block.image.caption) :
        'Notion image';
      return `<figure>
        <img src="${imgUrl}" alt="${caption}" />
        ${block.image.caption ? `<figcaption>${caption}</figcaption>` : ''}
      </figure>`;

    case 'video':
      const videoUrl = block.video.type === 'external' ?
        block.video.external.url :
        block.video.file.url;
      return `<video src="${videoUrl}" controls></video>`;

    case 'divider':
      return '<hr>';

    case 'table':
      return '<div class="table-wrapper">Table content</div>';

    case 'column_list':
      return '<div class="columns">Column content</div>';

    default:
      return '';
  }
};

interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: any; // For flexible block type properties
}

interface NotionResponse {
  results: NotionBlock[];
  next_cursor: string | null;
  has_more: boolean;
}

/**
 * Recursively fetches and converts nested Notion blocks to HTML
 * Handles special cases like lists and toggles
 * @param blockId - ID of the Notion block to process
 * @returns Promise resolving to HTML string
 */
const getNestedBlocks = async (blockId: string): Promise<string> => {
  try {
    let allBlocks: NotionBlock[] = [];
    let cursor: string | undefined = undefined;
    
    // Fetch all blocks using pagination
    do {
      const response: NotionResponse = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
        page_size: 100, // Max page size
      });
      
      allBlocks = [...allBlocks, ...response.results];
      cursor = response.next_cursor || undefined;
    } while (cursor);

    let html = '';
    let inBulletedList = false;
    let inNumberedList = false;

    for (const block of allBlocks) {
      // Handle nested blocks
      if (block.has_children) {
        const childContent = await getNestedBlocks(block.id);

        switch (block.type) {
          case 'toggle':
            html += `<details>
              <summary>${richTextToHtml(block[block.type].rich_text)}</summary>
              ${childContent}
            </details>`;
            continue;
          case 'column_list':
            html += `<div class="columns">${childContent}</div>`;
            continue;
          default:
            html += convertBlock(block) + childContent;
            continue;
        }
      }

      // Handle list containers
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
        // Close any open lists when encountering non-list blocks
        if (inBulletedList) {
          html += '</ul>';
          inBulletedList = false;
        }
        if (inNumberedList) {
          html += '</ol>';
          inNumberedList = false;
        }
      }

      html += convertBlock(block);
    }

    // Close any remaining open lists
    if (inBulletedList) html += '</ul>';
    if (inNumberedList) html += '</ol>';

    return html;
  } catch (error) {
    console.error('Error fetching nested blocks:', error);
    throw error;
  }
}; 