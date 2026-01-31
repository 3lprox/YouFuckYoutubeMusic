import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  try {
    // Usamos el nodo de Piped para obtener el stream directo
    const response = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
    
    if (!response.ok) {
      throw new Error("El nodo de Symphony no responde");
    }

    const data = await response.json();

    // Buscamos el stream de audio en formato M4A (nativo de Apple y Android)
    const audioStream = data.audioStreams.find((s: any) => 
      s.format === "M4A" || s.mimeType.includes("audio/mp4")
    );

    if (!audioStream) {
      throw new Error("No se encontró un formato de audio compatible");
    }

    res.status(200).json({
      title: data.title,
      artist: data.uploader,
      thumbnail: data.thumbnailUrl,
      streamUrl: audioStream.url
    });

  } catch (e) {
    res.status(500).json({ 
      error: "Symphony Node Error", 
      details: String(e) 
    });
  }
}
