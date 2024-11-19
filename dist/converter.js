"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionToMediumHTML = void 0;
const html_utils_1 = require("./html.utils");
class NotionToMediumHTML {
    convertToMediumHTML(blocks) {
        const article = blocks
            .map(block => this.processBlock(block))
            .filter(Boolean)
            .join('\n\n');
        return `${article}`;
    }
    processBlock(block) {
        switch (block.type) {
            case 'paragraph':
                return `<p>${this.processParagraph(block.paragraph?.rich_text || [])}</p>`;
            case 'heading_1':
                return `<h1>${this.processText(block.heading_1?.rich_text || [])}</h1>`;
            case 'code':
                return this.processCode(block.code);
            default:
                return '';
        }
    }
    processParagraph(richText) {
        return richText.map(text => this.formatText(text)).join('');
    }
    processText(richText) {
        return richText.map(text => text.plain_text).join('');
    }
    processCode(code) {
        if (!code?.rich_text?.[0])
            return '';
        const content = code.rich_text[0].plain_text;
        const language = code.language || '';
        return `<pre data-language="${language}"><code>${html_utils_1.HtmlUtils.escapeHtml(content)}</code></pre>`;
    }
    formatText(text) {
        let content = html_utils_1.HtmlUtils.escapeHtml(text.text.content);
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
