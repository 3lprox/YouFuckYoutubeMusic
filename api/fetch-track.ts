import type { VercelRequest, VercelResponse } from '@vercel/node';

const INVIDIOUS_DOMAINS = [
  "inv.tux.pizza", "iv.melmac.space", "invidious.perennialte.ch", "yewtu.be", 
  "inv.nand.sh", "invidious.lunar.icu", "iv.ggtyler.dev", "invidious.projectsegfau.lt", 
  "invidious.privacydev.net", "invidious.flokinet.to"
];

const PIPED_DOMAINS = [
  "pipedapi.kavin.rocks", "api.piped.victr.me", "piped-api.garudalinux.org", 
  "pipedapi.drgns.space", "pipedapi.astartes.nl", "api.piped.privacydev.net", 
  "pipedapi.adminforge.de", "pipedapi.qdi.fi", "pipedapi.ducks.party", "pipedapi.vern.cc"
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId, q } = req.query;

  if (q) {
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

  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  const nodes: { url: string; type: 'inv' | 'piped' }[] = [];
  for (let i = 0; i < 250; i++) {
    nodes.push({ 
      url: `https://${INVIDIOUS_DOMAINS[i % INVIDIOUS_DOMAINS.length]}/api/v1/videos/${videoId}`, 
      type: 'inv' 
    });
    nodes.push({ 
      url: `https://${PIPED_DOMAINS[i % PIPED_DOMAINS.length]}/streams/${videoId}`, 
      type: 'piped' 
    });
  }

  const shuffled = nodes.sort(() => Math.random() - 0.5);

  const requestNode = async (node: any) => {
    const response = await fetch(node.url, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error();
    const data = await response.json();
    
    let stream;
    if (node.type === 'inv') {
      stream = data.adaptiveFormats?.find((f: any) => f.container === "m4a" || f.type.includes("audio/mp4"));
    } else {
      stream = data.audioStreams?.find((s: any) => s.format === "M4A" || s.mimeType.includes("audio/mp4"));
    }

    if (!stream?.url) throw new Error();
    return {
      streamUrl: stream.url,
      title: data.title,
      artist: data.author || data.uploader,
      thumbnail: data.videoThumbnails?.[0]?.url || data.thumbnailUrl
    };
  };

  try {
    const result = await Promise.any(shuffled.slice(0, 15).map(n => requestNode(n)));
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: "Symphony Nodes Exhausted" });
  }
}
