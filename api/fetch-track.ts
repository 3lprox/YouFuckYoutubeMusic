import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  try {
    // Usamos el cliente WEB_REMIX que es el de YouTube Music Web
    const response = await fetch(`https://music.youtube.com/youtubei/v1/player?key=AIzaSyAO_Sshmto67S60V6wA`, {
      method: 'POST',
      body: JSON.stringify({
        context: {
          client: { clientName: "WEB_REMIX", clientVersion: "1.20240125.01.00" }
        },
        videoId: videoId
      })
    });

    const data = await response.json();
    
    // Filtrar para obtener la mejor calidad de audio
    const formats = data.streamingData?.adaptiveFormats || [];
    const audioFormat = formats.find((f: any) => f.itag === 140) || formats.find((f: any) => f.mimeType.includes('audio'));

    if (!audioFormat || !audioFormat.url) {
      return res.status(403).json({ 
        error: "YouTube bloqueó el enlace directo",
        reason: "Requiere descifrado de firma (Signature)" 
      });
    }

    res.status(200).json({
      title: data.videoDetails.title,
      artist: data.videoDetails.author,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      streamUrl: audioFormat.url // Enlace directo al audio
    });

  } catch (e) {
    res.status(500).json({ error: "Error de servidor" });
  }
}
