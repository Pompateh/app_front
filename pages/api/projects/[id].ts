// pages/api/projects/[id].ts
import axiosInstance from '../../../lib/axiosInstance';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    const token = req.cookies['accessToken'] || req.headers.authorization?.split(' ')[1];

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    if (req.method === 'PUT') {
      const result = await axiosInstance.put(`/projects/${id}`, req.body, config);
      res.status(200).json(result.data);
    } else if (req.method === 'DELETE') {
      const result = await axiosInstance.delete(`/projects/${id}`, config);
      res.status(200).json(result.data);
    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}
