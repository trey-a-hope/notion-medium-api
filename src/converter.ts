// import { NotionBlock, NotionText } from './types';
// import { HtmlUtils } from './html.utils';

// /**
//  * Converts Notion blocks to Medium-compatible HTML
//  * Handles paragraphs, headings, and code blocks with their respective formatting
//  */
// export class NotionToMediumHTML {
//   /**
//    * Converts an array of Notion blocks into Medium-compatible HTML
//    * @param blocks Array of Notion content blocks to convert
//    * @returns A single HTML string representing the entire article
//    */
//   convertToMediumHTML(blocks: NotionBlock[]): string {
//     const article = blocks
//       .map(block => this.processBlock(block))    // Convert each block to HTML
//       .filter(Boolean)                           // Remove empty/unsupported blocks
//       .join('');                                // Combine into single string

//     return `${article}`;
//   }

//   /**
//    * Processes a single Notion block based on its type
//    * Supports paragraphs, level 1 headings, and code blocks
//    * @param block The Notion block to process
//    * @returns HTML string for the processed block
//    */
//   private processBlock(block: NotionBlock): string {
//     switch (block.type) {
//       case 'paragraph':
//         return `<p>${this.processParagraph(block.paragraph?.rich_text || [])}</p>`;

//       case 'heading_1':
//         return `<h1>${this.processText(block.heading_1?.rich_text || [])}</h1>`;

//       case 'heading_2':
//         return `<h2>${this.processText(block.heading_2?.rich_text || [])}</h2>`;

//       case 'heading_3':
//         return `<h3>${this.processText(block.heading_3?.rich_text || [])}</h3>`;

//       case 'code':
//         return this.transformCodeBlock(block.code);
//       // return this.processCode(block.code);

//       default:
//         return ''; // Unsupported block types are skipped
//     }
//   }

//   /**
//    * Processes paragraph content with rich text formatting
//    * @param richText Array of rich text segments to process
//    * @returns HTML string with formatted paragraph content
//    */
//   private processParagraph(richText: NotionText[]): string {
//     return richText.map(text => this.formatText(text)).join('');
//   }

//   /**
//    * Processes plain text without formatting (used mainly for headings)
//    * @param richText Array of rich text segments
//    * @returns Plain text string with segments combined
//    */
//   private processText(richText: NotionText[]): string {
//     return richText.map(text => text.plain_text).join('');
//   }

//   private transformCodeBlock(block: any) {
//     // Only process if it's a code block
//     if (block.type !== 'code') return block;

//     // Reconstruct the code block structure
//     return {
//       type: 'code',
//       code: {
//         rich_text: [{
//           type: 'text',
//           text: {
//             content: block.plain_text || '',
//             link: null
//           },
//           annotations: {
//             bold: false,
//             italic: false,
//             strikethrough: false,
//             underline: false,
//             code: true,
//             color: 'default'
//           },
//           plain_text: block.plain_text || ''
//         }],
//         language: block.language || 'plain',
//         caption: []
//       }
//     };
//   }

//   /**
//    * Processes a code block with language-specific formatting
//    * Now handles formatting within code blocks
//    * @param code Code block data containing content and language
//    * @returns HTML string with formatted code content
//    */
//   private processCode(code: any): string {
//     if (!code?.rich_text || code.rich_text.length === 0) return '';

//     // Process all rich text segments in the code block
//     const content = code.rich_text
//       .map((text: any) => this.formatCodeText(text))
//       .join('');

//     const language = code.language || '';
//     return `<pre data-language="${language}"><code>${content}</code></pre>`;
//   }

//   /**
//    * Special formatting for code block content
//    * Similar to formatText but only applies relevant code formatting
//    * @param text Rich text segment within a code block
//    * @returns Formatted code content
//    */
//   private formatCodeText(text: NotionText): string {
//     // For code blocks, we typically just want the escaped content
//     // Most formatting (bold, italic, etc.) shouldn't apply inside code blocks
//     return HtmlUtils.escapeHtml(text.text.content);
//   }

//   /**
//    * Applies text formatting annotations to a single text segment
//    * Handles bold, italic, code, strikethrough, and underline formatting
//    * 
//    * Note: The order of formatting is important to maintain proper tag nesting:
//    * 1. Bold
//    * 2. Italic
//    * 3. Code
//    * 4. Strikethrough
//    * 5. Underline
//    * 
//    * @param text Rich text segment with formatting annotations
//    * @returns HTML string with all formatting applied
//    */
//   private formatText(text: NotionText): string {
//     // First escape the raw content to prevent XSS
//     let content = HtmlUtils.escapeHtml(text.text.content);

//     // Apply formatting in specific order
//     if (text.annotations.bold) {
//       content = `<strong>${content}</strong>`;
//     }
//     if (text.annotations.italic) {
//       content = `<em>${content}</em>`;
//     }
//     if (text.annotations.code) {
//       content = `<code>${content}</code>`;
//     }
//     if (text.annotations.strikethrough) {
//       content = `<del>${content}</del>`;
//     }
//     if (text.annotations.underline) {
//       content = `<u>${content}</u>`;
//     }

//     return content;
//   }
// }