import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  // Lista de 20 instancias de Invidious
  const invidiousInstances = [
    "https://inv.tux.pizza", "https://iv.melmac.space", "https://invidious.perennialte.ch",
    "https://invidious.flokinet.to", "https://invidious.privacydev.net", "https://iv.ggtyler.dev",
    "https://invidious.lunar.icu", "https://inv.nand.sh", "https://invidious.projectsegfau.lt",
    "https://invidious.asir.dev", "https://invidious.malevolent.it", "https://iv.is.nota.live",
    "https://invidious.sethforprivacy.com", "https://invidious.tiekoetter.com", "https://inv.riverside.rocks",
    "https://invidious.garudalinux.org", "https://invidious.pablouser.me", "https://iv.rebel-it.services",
    "https://invidious.skrep.eu", "https://invidious.stemy.me"
  ];

  // Lista de 25 instancias de Piped
  const pipedInstances = [
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

  // Mezclamos y aleatorizamos para no saturar siempre los mismos
  const allNodes = [
    ...invidiousInstances.map(url => ({ url: `${url}/api/v1/videos/${videoId}`, type: 'invidious' })),
    ...pipedInstances.map(url => ({ url: `${url}/streams/${videoId}`, type: 'piped' }))
  ].sort(() => Math.random() - 0.5);

  for (const node of allNodes) {
    try {
      const response = await fetch(node.url, { signal: AbortSignal.timeout(3500) });
      if (!response.ok) continue;

      const data = await response.json();
      let audioStream;

      if (node.type === 'invidious') {
        audioStream = data.adaptiveFormats.find((f: any) => f.container === "m4a" || f.type.includes("audio/mp4"));
        if (audioStream) {
          return res.status(200).json({
            title: data.title,
            artist: data.author,
            thumbnail: data.videoThumbnails[0].url,
            streamUrl: audioStream.url
          });
        }
      } else {
        audioStream = data.audioStreams.find((s: any) => s.format === "M4A" || s.mimeType.includes("audio/mp4"));
        if (audioStream) {
          return res.status(200).json({
            title: data.title,
            artist: data.uploader,
            thumbnail: data.thumbnailUrl,
            streamUrl: audioStream.url
          });
        }
      }
    } catch (e) {
      continue;
    }
  }

  res.status(500).json({ error: "Symphony Nodes Exhausted", details: "Ninguno de los 45 nodos respondió." });
}
