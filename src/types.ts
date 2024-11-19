export interface NotionText {
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
}

export interface NotionBlock {
  type: string;
  paragraph?: {
    rich_text: NotionText[];
  };
  heading_1?: {
    rich_text: NotionText[];
  };
  code?: {
    rich_text: NotionText[];
    language: string;
    caption: any[];
  };
}
