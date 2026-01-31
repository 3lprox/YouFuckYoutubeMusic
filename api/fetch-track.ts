import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: "Falta el ID" });

  // Intentamos obtener el stream a través de un servicio de distribución de medios abierto
  // Este servicio actúa como un túnel para que YouTube no vea la IP de Vercel
  const streamService = `https://api.vevioz.com/api/button/mp3/${videoId}`;

  try {
    // En lugar de procesar el audio, Symphony redirigirá al stream directo
    // Esto evita que Vercel sea el que "pide" el archivo y sea bloqueado
    res.status(200).json({
      title: "Cargando audio...",
      artist: "Symphony Player",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      streamUrl: `https://convert.pwnyoutube.com/download/mp3/${videoId}` 
    });
  } catch (e) {
    res.status(500).json({ error: "Error en el nodo Symphony" });
  }
}
