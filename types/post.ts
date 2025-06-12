export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    jobTitle?: string;
  };
  type?: string;
  readingTime?: string;
  quote?: string;
  quoteAuthor?: string;
  referencePicUrl?: string;
  referencePicName?: string;
  contentSources?: string[];
  additionalContent?: {
    title: string;
    paragraph: string;
  }[];
}

export default Post; 