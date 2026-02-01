import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId, q } = req.query;

  // Si se busca por texto (para la lista de resultados)
  if (q) {
    try {
      const searchRes = await fetch(`https://pipedapi.kavin.rocks/search?q=${q}&filter=videos`);
      const searchData = await searchRes.json();
      return res.status(200).json(searchData.items.map((item: any) => ({
        videoId: item.url.split("v=")[1],
        title: item.title,
        artist: item.uploaderName,
        thumbnail: item.thumbnail
      })));
    } catch (e) {
      return res.status(500).json({ error: "Error en búsqueda" });
    }
  }

  // Si se busca un stream específico (Motor de 45 nodos)
  if (!videoId) return res.status(400).json({ error: "Falta ID" });

  const invidious = [
    "https://inv.tux.pizza", "https://iv.melmac.space", "https://invidious.perennialte.ch",
    "https://invidious.flokinet.to", "https://invidious.privacydev.net", "https://iv.ggtyler.dev",
    "https://invidious.lunar.icu", "https://inv.nand.sh", "https://invidious.projectsegfau.lt",
    "https://invidious.asir.dev", "https://invidious.malevolent.it", "https://iv.is.nota.live",
    "https://invidious.sethforprivacy.com", "https://invidious.tiekoetter.com", "https://inv.riverside.rocks",
    "https://invidious.garudalinux.org", "https://invidious.pablouser.me", "https://iv.rebel-it.services",
    "https://invidious.skrep.eu", "https://invidious.stemy.me"
  ];

  const pipeds = [
    "https://pipedapi.kavin.rocks", "https://api.piped.victr.me", "https://piped-api.garudalinux.org",
    "https://pipedapi.drgns.space", "https://pipedapi.astartes.nl", "https://api-piped.mha.fi",
    "https://pipedapi.berrytube.tv", "https://pipedapi.pablo.casa", "https://pipedapi.moomoo.me",
    "https://pipedapi.syncit.dev", "https://pipedapi.rivo.cc", "https://pipedapi.lunar.icu",
    "https://pipedapi.ramat.me", "https://piped-api.lre.p6.lu", "https://pipedapi.hostux.net",
    "https://api.piped.privacydev.net", "https://pipedapi.adminforge.de", "https://pipedapi.qdi.fi",
    "https://pipedapi.projectsegfau.lt", "https://pipedapi.deno.dev", "https://pipedapi.ducks.party",
    "https://pipedapi.mobi.casa", "https://pipedapi.silkky.cloud", "https://pipedapi.ggtyler.dev",
    "https://pipedapi.vern.cc"
  ];

  const allNodes = [
    ...invidious.map(url => ({ url: `${url}/api/v1/videos/${videoId}`, type: 'inv' })),
    ...pipeds.map(url => ({ url: `${url}/streams/${videoId}`, type: 'piped' }))
  ].sort(() => Math.random() - 0.5);

  for (const node of allNodes) {
    try {
      const response = await fetch(node.url, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) continue;
      const data = await response.json();
      let stream;
      if (node.type === 'inv') {
        stream = data.adaptiveFormats.find((f: any) => f.container === "m4a" || f.type.includes("audio/mp4"));
      } else {
        stream = data.audioStreams.find((s: any) => s.format === "M4A" || s.mimeType.includes("audio/mp4"));
      }
      if (stream) return res.status(200).json({ streamUrl: stream.url, title: data.title, artist: data.author || data.uploader, thumbnail: data.videoThumbnails?.[0]?.url || data.thumbnailUrl });
    } catch (e) { continue; }
  }
  res.status(500).json({ error: "Nodos agotados" });
}
