import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const REGION = "eu";
  const PLATFORM = "pc";
  const PUUID = "9198dc1c-786f-5813-8ddb-aeae27c24324";
  const API_KEY = "HDEV-d87631e4-e442-4dd9-8915-8d625f5b49c4"; // Stocke ta clé dans Vercel (env var)

  try {
    const url = `https://api.henrikdev.xyz/valorant/v2/by-puuid/mmr-history/${REGION}/${PLATFORM}/${PUUID}?api_key=${API_KEY}`;
    const data = await fetch(url).then(r => r.json());

    if (!data?.data?.history?.length) {
      return res.send("Aucune donnée Valorant trouvée.");
    }

    const lastMatch = data.data.history[0];
    const rrChange = lastMatch.last_change;
    const rrSign = rrChange >= 0 ? "+" : "";
    const map = lastMatch.map?.name || "Unknown Map";
    const name = data.data.account?.name || "Unknown";
    const tag = data.data.account?.tag || "???";
    const tier = lastMatch.tier?.name || "Unranked";
    const rr = lastMatch.rr ?? "?";

    const message = `${tier} ${rr}RR. ${rrSign}${rrChange} RR from last game on ${map}.`;
    res.send(message);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur API Valorant");
  }
}
