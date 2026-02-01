import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });

  try {
    const response = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q as string)}&filter=videos`);
    const data = await response.json();
    return res.status(200).json(data.items.map((item: any) => ({
      videoId: item.url.split("v=")[1],
      title: item.title,
      artist: item.uploaderName,
      thumbnail: item.thumbnail
    })));
  } catch (e) {
    return res.status(500).json({ error: "Search failed" });
  }
}
