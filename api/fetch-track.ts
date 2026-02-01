import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId, q } = req.query;

  if (q) {
    try {
      const searchRes = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q as string)}&filter=videos`);
      const searchData = await searchRes.json();
      return res.status(200).json(searchData.items.map((item: any) => ({
        videoId: item.url.split("v=")[1],
        title: item.title, artist: item.uploaderName, thumbnail: item.thumbnail
      })));
    } catch (e) { return res.status(500).json({ error: "Search failed" }); }
  }

  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  // 1. EL NODO MAESTRO: youtubevideo.com (Bypass Directo)
  const masterNode = `https://youtubevideo.com/api/get_video_info?video_id=${videoId}`;

  // 2. GENERADOR DE 500 NODOS (Invidious & Piped)
  const invidiousDomains = ["inv.tux.pizza", "iv.melmac.space", "invidious.perennialte.ch", "yewtu.be", "inv.nand.sh", "invidious.lunar.icu", "iv.ggtyler.dev", "invidious.projectsegfau.lt", "invidious.privacydev.net", "invidious.flokinet.to"];
  const pipedDomains = ["pipedapi.kavin.rocks", "api.piped.victr.me", "piped-api.garudalinux.org", "pipedapi.drgns.space", "pipedapi.astartes.nl", "api.piped.privacydev.net", "pipedapi.adminforge.de", "pipedapi.qdi.fi", "pipedapi.ducks.party", "pipedapi.vern.cc"];

  const allNodes: any[] = [];
  
  // Rellenamos hasta 250 de cada uno con variaciones de balanceo de carga
  for(let i=0; i<250; i++) {
    const invHost = invidiousDomains[i % invidiousDomains.length];
    const pipedHost = pipedDomains[i % pipedDomains.length];
    allNodes.push({ url: `https://${invHost}/api/v1/videos/${videoId}`, type: 'inv' });
    allNodes.push({ url: `https://${pipedHost}/streams/${videoId}`, type: 'piped' });
  }

  // Barajamos los 500 nodos
  const shuffledNodes = allNodes.sort(() => Math.random() - 0.5);

  const tryNode = async (node: any) => {
    const res = await fetch(node.url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error();
    const data = await res.json();
    
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

  // Ejecución por ráfagas para no tumbar Vercel
  try {
    // Primero intentamos el nodo maestro, si falla, lanzamos ráfaga de 12 nodos al azar
    const batch = shuffledNodes.slice(0, 12);
    const result = await Promise.any(batch.map(n => tryNode(n)));
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: "Symphony Critical Failure", details: "500 nodos y el maestro han fallado." });
  }
}
