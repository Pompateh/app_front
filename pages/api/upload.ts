import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (name: string, ext: string, part: formidable.Part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  form.parse(req, (err: any, fields: formidable.Fields, files: formidable.Files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Upload failed' });
    }

    // Handle both single file and array of files
    const fileData = files.file;
    const fileArray = Array.isArray(fileData) ? fileData : [fileData];
    const uploadedFile = fileArray[0]; // Assuming you want the first file

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = uploadedFile.newFilename;
    const fileUrl = `/uploads/${fileName}`;

    return res.status(200).json({ url: fileUrl });
  });
};

export default handler;