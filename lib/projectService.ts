export interface ProjectDTO {
    title: string;
    slug: string;
    type: string;
    description: string;
    category: string;
    thumbnail?: string;
    blocks: any[];
    team: { name: string; role: string }[];
  }
  
  export const projectService = {};