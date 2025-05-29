import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001',
  withCredentials: true,
});

export default axiosInstance;
