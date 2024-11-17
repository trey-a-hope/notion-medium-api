export interface NotionBlock {
    type: string;
    properties?: {
      title?: Array<Array<string>>;
      language?: Array<Array<string>>;
      caption?: Array<Array<string>>;
      source?: Array<Array<string>>;
    };
  }
  
  export interface NotionExport {
    blocks: NotionBlock[];
  }
  
  export interface MediumContent {
    title: string;
    contentFormat: string;
    content: string;
    tags: string[];
    publishStatus: string;
  }