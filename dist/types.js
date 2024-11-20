"use strict";
// // Interface representing a text segment in Notion
// // Each piece of text can have its own styling and formatting
// export interface NotionText {
//   // Identifies the type of the text block
//   type: string;
//   // Contains the actual text content and any associated link
//   text: {
//     // The text content itself
//     content: string;
//     // Optional URL if the text is a link, null otherwise
//     link: null | string;
//   };
//   // Formatting annotations that can be applied to the text
//   annotations: {
//     // Text can be bold
//     bold: boolean;
//     // Text can be italicized
//     italic: boolean;
//     // Text can have a strikethrough
//     strikethrough: boolean;
//     // Text can be underlined
//     underline: boolean;
//     // Text can be formatted as inline code
//     code: boolean;
//     // Color of the text (e.g., "default", "gray", "brown", etc.)
//     color: string;
//   };
//   // The raw text content without any formatting
//   plain_text: string;
// }
// // Interface representing a block in Notion
// // Blocks are the fundamental units of content (paragraphs, headings, code blocks, etc.)
// export interface NotionBlock {
//   // Identifies the type of block (paragraph, heading_1, heading_2, heading_3, code, etc.)
//   type: string;
//   // Optional paragraph block structure
//   // Contains an array of rich text objects for the paragraph content
//   paragraph?: {
//     rich_text: NotionText[];
//   };
//   // Optional heading level 1 block structure
//   // Contains an array of rich text objects for the heading content
//   heading_1?: {
//     rich_text: NotionText[];
//   };
//   // Optional heading level 2 block structure
//   // Contains an array of rich text objects for the heading content
//   heading_2?: {
//     rich_text: NotionText[];
//   };
//   // Optional heading level 3 block structure
//   // Contains an array of rich text objects for the heading content
//   heading_3?: {
//     rich_text: NotionText[];
//   };
//   // Optional code block structure
//   code?: {
//     // The code content as rich text
//     rich_text: NotionText[];
//     // Programming language for syntax highlighting
//     language: string;
//     // Optional captions for the code block
//     caption: any[];
//   };
// }
