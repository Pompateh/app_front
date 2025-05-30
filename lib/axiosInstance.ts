import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://app-back-gc64.onrender.com',
  withCredentials: true,
});

export default axiosInstance;
