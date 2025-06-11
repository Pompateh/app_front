// pages/api/projects/index.ts
import axiosInstance from '../../../lib/axiosInstance';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies['accessToken'] || req.headers.authorization?.split(' ')[1];

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    if (req.method === 'POST') {
      const result = await axiosInstance.post('/projects', req.body, config);
      res.status(200).json(result.data);
    } else if (req.method === 'GET') {
      const result = await axiosInstance.get('/projects', config);
      res.status(200).json(result.data);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}
