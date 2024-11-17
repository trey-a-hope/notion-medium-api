"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionToMediumConverter = void 0;
class NotionToMediumConverter {
    constructor(notionData) {
        this.mediumContent = {
            title: '',
            contentFormat: 'html',
            content: '',
            tags: [],
            publishStatus: 'draft'
        };
        this.notionData = notionData;
    }
    convertBlock(block) {
        const content = block.properties?.title?.[0]?.[0] || '';
        switch (block.type) {
            case 'header':
                return `<h1>${content}</h1>`;
            case 'sub_header':
                return `<h2>${content}</h2>`;
            case 'sub_sub_header':
                return `<h3>${content}</h3>`;
            case 'numbered_list':
                return `<li>${content}</li>`;
            case 'bulleted_list':
                return `<li>${content}</li>`;
            case 'code':
                const language = block.properties?.language?.[0]?.[0] || 'text';
                return `<pre><code class="language-${language}">${content}</code></pre>`;
            case 'quote':
                return `<blockquote>${content}</blockquote>`;
            case 'image':
                const caption = block.properties?.caption?.[0]?.[0] || '';
                const url = block.properties?.source?.[0]?.[0] || '';
                return `<figure><img src="${url}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`;
            case 'text':
                return content ? `<p>${content}</p>` : '<br>';
            default:
                return `<p>${content}</p>`;
        }
    }
    processLists(htmlContent) {
        // Since we're in a Node.js environment, we'll use a simple string-based approach
        // instead of DOM manipulation
        let processedContent = htmlContent;
        // Find consecutive <li> elements and wrap them in appropriate list tags
        const wrapLists = (content) => {
            const liRegex = /<li>.*?<\/li>/g;
            const matches = content.match(liRegex);
            if (!matches)
                return content;
            let result = content;
            let currentList = '';
            let isProcessingList = false;
            matches.forEach((li, index) => {
                const nextLi = matches[index + 1];
                if (!isProcessingList) {
                    currentList = li;
                    isProcessingList = true;
                }
                else {
                    currentList += li;
                }
                if (!nextLi || !content.substring(content.indexOf(li) + li.length, content.indexOf(nextLi)).trim()) {
                    // Wrap the list items
                    const wrapper = `<ul>${currentList}</ul>`;
                    result = result.replace(currentList, wrapper);
                    isProcessingList = false;
                    currentList = '';
                }
            });
            return result;
        };
        processedContent = wrapLists(processedContent);
        return processedContent;
    }
    async convert() {
        try {
            const titleBlock = this.notionData.blocks.find(block => block.type === 'header');
            if (titleBlock?.properties?.title) {
                this.mediumContent.title = titleBlock.properties.title[0][0];
            }
            const htmlContent = this.notionData.blocks
                .map(block => this.convertBlock(block))
                .join('\n');
            this.mediumContent.content = this.processLists(htmlContent)
                .replace(/\n+/g, '\n')
                .trim();
            return this.mediumContent;
        }
        catch (error) {
            throw new Error(`Conversion failed: ${error}`);
        }
    }
}
exports.NotionToMediumConverter = NotionToMediumConverter;
