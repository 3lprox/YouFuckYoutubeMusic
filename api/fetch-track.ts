import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  try {
    // Usamos una instancia de Invidious (puedes cambiar la URL si una falla)
    const invidiousInstance = "https://invidious.lunar.icu"; 
    
    const response = await fetch(`${invidiousInstance}/api/v1/videos/${videoId}`);
    
    if (!response.ok) {
      throw new Error("Instancia de Invidious no disponible");
    }

    const data = await response.json();
    
    // Invidious nos da los formatos de audio directamente
    const audioFormat = data.adaptiveFormats.find((f: any) => f.container === "m4a" || f.type.includes("audio/mp4"));

    if (!audioFormat) {
      return res.status(404).json({ error: "No se encontró audio compatible" });
    }

    res.status(200).json({
      title: data.title,
      artist: data.author,
      thumbnail: data.videoThumbnails.find((t: any) => t.quality === "maxresdefault")?.url || data.videoThumbnails[0].url,
      streamUrl: audioFormat.url // Esta URL ya viene procesada y lista para sonar
    });

  } catch (e) {
    res.status(500).json({ 
      error: "Error de servidor", 
      details: "Intentando usar proxy alternativo...",
      msg: String(e) 
    });
  }
}
