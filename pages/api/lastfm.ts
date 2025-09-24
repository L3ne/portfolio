import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const username = "lennowo";
  const apiKey = "4649152008b1463070d55b6848273560";

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

  try {
    const data = await fetch(url).then(r => r.json());
    const track = data?.recenttracks?.track?.[0];

    if (!track) {
      return res.send("Aucune lecture en cours");
    }

    const artist = track.artist["#text"];
    const title = track.name;
    const nowPlaying = track["@attr"]?.nowplaying === "true";

    if (nowPlaying) {
      return res.send(`"${title}" par ${artist}`);
    } else {
      return res.send("Aucune lecture en cours");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur API Last.fm");
  }
}
