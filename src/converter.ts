import { NotionBlock, NotionText } from './types';
import { HtmlUtils } from './html.utils';

export class NotionToMediumHTML {
  convertToMediumHTML(blocks: NotionBlock[]): string {
    const article = blocks
      .map(block => this.processBlock(block))
      .filter(Boolean)
      .join('\n\n');

    return `${article}`;
  }

  private processBlock(block: NotionBlock): string {
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

  private processParagraph(richText: NotionText[]): string {
    return richText.map(text => this.formatText(text)).join('');
  }

  private processText(richText: NotionText[]): string {
    return richText.map(text => text.plain_text).join('');
  }

  private processCode(code: any): string {
    if (!code?.rich_text?.[0]) return '';
    const content = code.rich_text[0].plain_text;
    const language = code.language || '';
    return `<pre data-language="${language}"><code>${HtmlUtils.escapeHtml(content)}</code></pre>`;
  }

  private formatText(text: NotionText): string {
    let content = HtmlUtils.escapeHtml(text.text.content);

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