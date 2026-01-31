import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId } = req.query;
  const payload = {
    context: { client: { clientName: "ANDROID_MUSIC", clientVersion: "6.45.52", hl: "es-ES" } },
    videoId
  };

  try {
    const response = await fetch(`https://music.youtube.com/youtubei/v1/player?key=AIzaSyAO_Sshmto67S60V6wA`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'com.google.android.apps.youtube.music/6.45.52 (Linux; U; Android 14)' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const rawThumb = data.videoDetails.thumbnail.thumbnails.pop().url;
    const hdThumb = rawThumb.split('=')[0] + "=w1080-h1080-l90-rj";
    const audioUrl = data.streamingData.adaptiveFormats.find((f: any) => f.itag === 140)?.url;

    res.status(200).json({ title: data.videoDetails.title, artist: data.videoDetails.author, thumbnail: hdThumb, streamUrl: audioUrl });
  } catch (e) { res.status(500).json({ error: "Fetch error" }); }
}
