import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  try {
    const response = await fetch(`https://music.youtube.com/youtubei/v1/player?key=AIzaSyAO_Sshmto67S60V6wA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.ios.youtubemusic/6.41.2 (iPhone16,2; U; CPU iOS 17_5 like Mac OS X; es_ES)',
        'X-Youtube-Client-Name': '26',
        'X-Youtube-Client-Version': '6.41.2'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "IOS_MUSIC",
            clientVersion: "6.41.2",
            deviceModel: "iPhone16,2",
            osName: "iOS",
            osVersion: "17.5.0",
            hl: "es-ES",
            gl: "ES"
          }
        },
        videoId: videoId,
        playbackContext: {
          contentPlaybackContext: {
            signatureTimestamp: 19742 // Timestamp actual para el player de música
          }
        }
      })
    });

    const data = await response.json();
    
    // Si sigue saliendo "No disponible", probamos a buscar los datos en otra parte del JSON
    const playability = data.playabilityStatus;
    if (playability?.status !== "OK") {
       return res.status(403).json({ 
         error: "Restricción de YouTube", 
         reason: playability?.reason || "Contenido protegido"
       });
    }

    const formats = data.streamingData?.adaptiveFormats || [];
    // Priorizamos itag 140 (audio puro)
    const audioFormat = formats.find((f: any) => f.itag === 140) || formats.find((f: any) => f.mimeType.includes('audio'));

    if (!audioFormat?.url) {
      return res.status(403).json({ 
        error: "Firma requerida",
        details: "YouTube detectó el servidor" 
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
