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

  const hosts = [
    "pipedapi.kavin.rocks", "api.piped.victr.me", "piped-api.garudalinux.org",
    "pipedapi.drgns.space", "pipedapi.astartes.nl", "api.piped.privacydev.net",
    "pipedapi.adminforge.de", "pipedapi.qdi.fi", "pipedapi.projectsegfau.lt",
    "pipedapi.ducks.party", "pipedapi.mobi.casa", "pipedapi.vern.cc",
    "inv.tux.pizza", "iv.melmac.space", "invidious.perennialte.ch", "yewtu.be"
  ].sort(() => Math.random() - 0.5).slice(0, 8); // Seleccionamos 8 al azar para no saturar

  // Función interna para intentar un nodo
  const tryNode = async (host: string) => {
    const isInv = host.includes("inv") || host.includes("yewtu");
    const url = isInv ? `https://${host}/api/v1/videos/${videoId}` : `https://${host}/streams/${videoId}`;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error();
    const data = await response.json();
    
    const stream = isInv 
      ? data.adaptiveFormats?.find((f: any) => f.container === "m4a" || f.type.includes("audio/mp4"))
      : data.audioStreams?.find((s: any) => s.format === "M4A" || s.mimeType.includes("audio/mp4"));

    if (!stream?.url) throw new Error();
    return {
      streamUrl: stream.url,
      title: data.title,
      artist: data.author || data.uploader,
      thumbnail: data.videoThumbnails?.[0]?.url || data.thumbnailUrl
    };
  };

  try {
    // Promise.any lanza todas a la vez y devuelve la primera que funcione
    const fastestResult = await Promise.any(hosts.map(h => tryNode(h)));
    return res.status(200).json(fastestResult);
  } catch (e) {
    return res.status(500).json({ error: "Symphony Timeout", details: "Ningún nodo respondió a tiempo." });
  }
}
