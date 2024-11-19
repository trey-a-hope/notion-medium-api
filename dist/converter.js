"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionToMediumHTML = void 0;
const html_utils_1 = require("./html.utils");
/**
 * Converts Notion blocks to Medium-compatible HTML
 * Handles paragraphs, headings, and code blocks with their respective formatting
 */
class NotionToMediumHTML {
    /**
     * Converts an array of Notion blocks into Medium-compatible HTML
     * @param blocks Array of Notion content blocks to convert
     * @returns A single HTML string representing the entire article
     */
    convertToMediumHTML(blocks) {
        const article = blocks
            .map(block => this.processBlock(block)) // Convert each block to HTML
            .filter(Boolean) // Remove empty/unsupported blocks
            .join(''); // Combine into single string
        return `${article}`;
    }
    /**
     * Processes a single Notion block based on its type
     * Supports paragraphs, level 1 headings, and code blocks
     * @param block The Notion block to process
     * @returns HTML string for the processed block
     */
    processBlock(block) {
        switch (block.type) {
            case 'paragraph':
                return `<p>${this.processParagraph(block.paragraph?.rich_text || [])}</p>`;
            case 'heading_1':
                return `<h1>${this.processText(block.heading_1?.rich_text || [])}</h1>`;
            case 'code':
                return this.processCode(block.code);
            default:
                return ''; // Unsupported block types are skipped
        }
    }
    /**
     * Processes paragraph content with rich text formatting
     * @param richText Array of rich text segments to process
     * @returns HTML string with formatted paragraph content
     */
    processParagraph(richText) {
        return richText.map(text => this.formatText(text)).join('');
    }
    /**
     * Processes plain text without formatting (used mainly for headings)
     * @param richText Array of rich text segments
     * @returns Plain text string with segments combined
     */
    processText(richText) {
        return richText.map(text => text.plain_text).join('');
    }
    /**
     * Processes a code block with language-specific formatting
     * @param code Code block data containing content and language
     * @returns HTML string with formatted code content
     */
    processCode(code) {
        if (!code?.rich_text?.[0])
            return '';
        const content = code.rich_text[0].plain_text;
        const language = code.language || '';
        return `<pre data-language="${language}"><code>${html_utils_1.HtmlUtils.escapeHtml(content)}</code></pre>`;
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
    formatText(text) {
        // First escape the raw content to prevent XSS
        let content = html_utils_1.HtmlUtils.escapeHtml(text.text.content);
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
exports.NotionToMediumHTML = NotionToMediumHTML;
