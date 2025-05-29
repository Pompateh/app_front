// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import cookie from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  // Forward credentials to your Nest endpoint
  const apiRes = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  })

  if (!apiRes.ok) {
    const { message } = await apiRes.json()
    return res.status(apiRes.status).json({ message })
  }

  const { accessToken } = await apiRes.json()

  // Set it as an HttpOnly cookie
  res.setHeader('Set-Cookie', cookie.serialize('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  }))

  return res.status(200).json({ success: true })
}
