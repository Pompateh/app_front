declare module 'formidable' {
  import { IncomingMessage } from 'http';

  interface File {
    newFilename: string;
    originalFilename: string;
    mimetype: string;
    size: number;
  }

  interface Part {
    originalFilename: string;
  }

  interface Fields {
    [key: string]: string | string[];
  }

  interface Files {
    [key: string]: File | File[];
  }

  interface Options {
    uploadDir?: string;
    keepExtensions?: boolean;
    filename?: (name: string, ext: string, part: Part) => string;
  }

  class IncomingForm {
    constructor(options?: Options);
    parse(req: IncomingMessage, callback: (err: any, fields: Fields, files: Files) => void): void;
  }

  export = formidable;
}