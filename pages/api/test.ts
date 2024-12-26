import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Log request details
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  return res.status(200).json({
    success: true,
    message: 'Test endpoint working',
    method: req.method,
    headers: req.headers,
    body: req.body
  });
}
