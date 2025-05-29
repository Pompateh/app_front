export const API = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001'
  : process.env.NEXT_PUBLIC_API_URL || 'https://wearenewstalgia-api.up.railway.app'; 