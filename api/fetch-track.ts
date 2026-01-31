import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  const nodes = [
    "https://inv.tux.pizza",
    "https://iv.melmac.space",
    "https://invidious.perennialte.ch",
    "https://invidious.privacydev.net",
    "https://iv.ggtyler.dev",
    "https://inv.nand.sh",
    "https://invidious.projectsegfau.lt",
    "https://invidious.pablouser.me",
    "https://yewtu.be",
    "https://invidious.nerdvpn.de",
    "https://invidious.private.coffee",
    "https://vid.priv.au"
  ];

  const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

  try {
    const response = await fetch(`${randomNode}/api/v1/videos/${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    
    const data = await response.json();
    
    // Invidious devuelve a veces el audio en 'adaptiveFormats' o en 'formatStreams'
    const audioFormat = data.adaptiveFormats?.find((f: any) => 
      f.container === "m4a" || f.type?.includes("audio/mp4")
    ) || data.formatStreams?.find((f: any) => f.type?.includes("audio"));

    if (!audioFormat) throw new Error("No audio format");

    res.status(200).json({
      title: data.title,
      artist: data.author,
      thumbnail: data.videoThumbnails?.[0]?.url || "",
      streamUrl: audioFormat.url
    });

  } catch (e) {
    // Si falla, devolvemos el error exacto para saber qué pasa
    res.status(500).json({ 
      error: "Symphony Node Error", 
      node: randomNode,
      details: String(e)
    });
  }
}
