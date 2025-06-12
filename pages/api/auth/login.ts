// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import cookie from 'cookie'

interface LoginResponse {
  accessToken: string;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Forward credentials to your Nest endpoint
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await apiRes.json() as LoginResponse;

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ message: data.message || 'Login failed' });
    }

    const { accessToken } = data;

    if (!accessToken) {
      return res.status(500).json({ message: 'No access token received from server' });
    }

    // Set it as an HttpOnly cookie
    res.setHeader('Set-Cookie', cookie.serialize('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    }));

    // Return the token in the response for the frontend
    return res.status(200).json({ success: true, token: accessToken });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
