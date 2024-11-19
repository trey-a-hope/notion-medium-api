import { NotionBlock, NotionText, NotionImageBlock } from './types';
import { HtmlUtils } from './html.utils';

/**
 * Converts Notion blocks to Medium-compatible HTML
 * Handles paragraphs, headings, and code blocks with their respective formatting
 */
export class NotionToMediumHTML {
  /**
   * Converts an array of Notion blocks into Medium-compatible HTML
   * @param blocks Array of Notion content blocks to convert
   * @returns A single HTML string representing the entire article
   */
  convertToMediumHTML(blocks: NotionBlock[]): string {
    const article = blocks
      .map(block => this.processBlock(block))    // Convert each block to HTML
      .filter(Boolean)                           // Remove empty/unsupported blocks
      .join('');                                // Combine into single string

    return `${article}`;
  }

  /**
   * Processes a single Notion block based on its type
   * Supports paragraphs, level 1 headings, and code blocks
   * @param block The Notion block to process
   * @returns HTML string for the processed block
   */
  private processBlock(block: NotionBlock): string {
    switch (block.type) {
      case 'paragraph':
        return `<p>${this.processParagraph(block.paragraph?.rich_text || [])}</p>`;

      case 'heading_1':
        return `<h1>${this.processText(block.heading_1?.rich_text || [])}</h1>`;

      case 'code':
        return this.processCode(block.code);

      case 'image':
        return this.processImage(block as unknown as NotionImageBlock);

      default:
        return ''; // Unsupported block types are skipped
    }
  }

  /**
   * Processes paragraph content with rich text formatting
   * @param richText Array of rich text segments to process
   * @returns HTML string with formatted paragraph content
   */
  private processParagraph(richText: NotionText[]): string {
    return richText.map(text => this.formatText(text)).join('');
  }

  /**
   * Processes plain text without formatting (used mainly for headings)
   * @param richText Array of rich text segments
   * @returns Plain text string with segments combined
   */
  private processText(richText: NotionText[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  /**
   * Processes a code block with language-specific formatting
   * @param code Code block data containing content and language
   * @returns HTML string with formatted code content
   */
  private processCode(code: any): string {
    if (!code?.rich_text?.[0]) return '';
    const content = code.rich_text[0].plain_text;
    const language = code.language || '';
    return `<pre data-language="${language}"><code>${HtmlUtils.escapeHtml(content)}</code></pre>`;
  }

  /**
 * Processes an image block from Notion
 * Converts it to Medium-compatible HTML with optional caption
 * @param block The Notion image block to process
 * @returns HTML string for the image with optional caption
 */
  private processImage(block: NotionImageBlock): string {
    if (!block?.image?.file?.url) return '';

    // Get the image URL
    const imageUrl = block.image.file.url;

    // Process caption if it exists
    let caption = '';
    if (block.image.caption && block.image.caption.length > 0) {
      const captionText = block.image.caption[0]?.text?.content || '';
      if (captionText) {
        caption = `<figcaption>${HtmlUtils.escapeHtml(captionText)}</figcaption>`;
      }
    }

    // Return figure element with image and optional caption
    return `
    <figure>
      <img src="${HtmlUtils.escapeHtml(imageUrl)}" alt="${caption ? HtmlUtils.escapeHtml(caption) : ''}" />
      ${caption}
    </figure>
  `.trim();
  }

  /**
   * Applies text formatting annotations to a single text segment
   * Handles bold, italic, code, strikethrough, and underline formatting
   * 
   * Note: The order of formatting is important to maintain proper tag nesting:
   * 1. Bold
   * 2. Italic
   * 3. Code
   * 4. Strikethrough
   * 5. Underline
   * 
   * @param text Rich text segment with formatting annotations
   * @returns HTML string with all formatting applied
   */
  private formatText(text: NotionText): string {
    // First escape the raw content to prevent XSS
    let content = HtmlUtils.escapeHtml(text.text.content);

    // Apply formatting in specific order
    if (text.annotations.bold) {
      content = `<strong>${content}</strong>`;
    }
    if (text.annotations.italic) {
      content = `<em>${content}</em>`;
    }
    if (text.annotations.code) {
      content = `<code>${content}</code>`;
    }
    if (text.annotations.strikethrough) {
      content = `<del>${content}</del>`;
    }
    if (text.annotations.underline) {
      content = `<u>${content}</u>`;
    }

    return content;
  }
}