import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  const nodes = [
    "https://inv.tux.pizza", "https://iv.melmac.space", "https://invidious.perennialte.ch",
    "https://invidious.flokinet.to", "https://invidious.privacydev.net", "https://iv.ggtyler.dev",
    "https://invidious.lunar.icu", "https://inv.nand.sh", "https://invidious.projectsegfau.lt",
    "https://invidious.asir.dev", "https://invidious.malevolent.it", "https://iv.is.nota.live",
    "https://invidious.sethforprivacy.com", "https://invidious.tiekoetter.com", "https://inv.riverside.rocks",
    "https://invidious.garudalinux.org", "https://invidious.pablouser.me", "https://iv.rebel-it.services",
    "https://invidious.skrep.eu", "https://invidious.stemy.me", "https://invidious.snopyta.org",
    "https://yewtu.be", "https://invidious.kavin.rocks", "https://inv.odyssey346.dev",
    "https://invidious.mutatux.com", "https://invidious.namazso.eu", "https://inv.bp.projectsegfau.lt",
    "https://invidious.jit.li", "https://invidious.zapashcanon.fr", "https://invidious.tinfoil-hat.net",
    "https://invidious.grimneko.de", "https://invidious.weblibre.org", "https://invidious.esmailelbob.xyz",
    "https://invidious.domain.glass", "https://invidious.lre.p6.lu", "https://invidio.xamh.de",
    "https://invidious.000.pe", "https://invidious.site", "https://invidious.sethforprivacy.com",
    "https://iv.melmac.space", "https://invidious.nerdvpn.de", "https://invidious.drivet.xyz",
    "https://invidious.private.coffee", "https://invidious.fdn.fr", "https://invidious.no-logs.com",
    "https://invidious.drgns.space", "https://invidious.bus-hit.me", "https://invidious.v0l.me",
    "https://vid.priv.au", "https://invidious.hu"
  ];

  const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

  try {
    const response = await fetch(`${randomNode}/api/v1/videos/${videoId}`);
    if (!response.ok) throw new Error("Nodo fallido");
    
    const data = await response.json();
    const audioFormat = data.adaptiveFormats.find((f: any) => 
      f.container === "m4a" || f.type.includes("audio/mp4")
    );

    if (!audioFormat) throw new Error("Sin audio");

    res.status(200).json({
      title: data.title,
      artist: data.author,
      thumbnail: data.videoThumbnails?.find((t: any) => t.quality === "maxresdefault")?.url || data.videoThumbnails?.[0]?.url,
      streamUrl: audioFormat.url
    });

  } catch (e) {
    // Reintento rápido con un nodo de alta confianza si el aleatorio falla
    try {
      const backup = await fetch(`https://inv.tux.pizza/api/v1/videos/${videoId}`);
      const bData = await backup.json();
      const bAudio = bData.adaptiveFormats.find((f: any) => f.container === "m4a" || f.type.includes("audio/mp4"));
      res.status(200).json({
        title: bData.title, artist: bData.author,
        thumbnail: bData.videoThumbnails[0].url, streamUrl: bAudio.url
      });
    } catch (err) {
      res.status(500).json({ error: "Symphony Nodes Overload", msg: "Intenta de nuevo." });
    }
  }
}
