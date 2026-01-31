import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  try {
    const response = await fetch(`https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}&categories=["music_offtopic"]`);
    if (response.status === 404) return res.status(200).json([]);
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) { res.status(200).json([]); }
}
