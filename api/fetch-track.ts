import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  try {
    const response = await fetch(`https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_Sshmto67S60V6wA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Chromecast; Google TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/tv'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "TVHTML5_SIMPLY_EMBEDDED",
            clientVersion: "2.20231201.03.00",
            platform: "TV",
            hl: "es-ES"
          }
        },
        videoId: videoId,
        playbackContext: {
          contentPlaybackContext: {
            signatureTimestamp: 19742
          }
        }
      })
    });

    const data = await response.json();
    
    // Si el video tiene restricciones de edad o es música "Premium", este cliente lo dirá aquí
    if (data.playabilityStatus?.status !== "OK") {
      return res.status(403).json({ 
        error: "Video no disponible", 
        reason: data.playabilityStatus?.reason 
      });
    }

    const formats = data.streamingData?.adaptiveFormats || [];
    // Buscamos el itag 140 (Audio M4A) que suele venir libre en TV
    const audioFormat = formats.find((f: any) => f.itag === 140) || formats.find((f: any) => f.mimeType.includes('audio'));

    if (!audioFormat || !audioFormat.url) {
      return res.status(403).json({ 
        error: "Firma requerida incluso en TV",
        suggestion: "Usa un ID de una canción normal, no un mix" 
      });
    }

    res.status(200).json({
      title: data.videoDetails.title,
      artist: data.videoDetails.author,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      streamUrl: audioFormat.url
    });

  } catch (e) {
    res.status(500).json({ error: "Error de servidor", details: String(e) });
  }
}
