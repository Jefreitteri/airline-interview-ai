export default async function handler(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    // Session config: realtime + voice
    const sessionConfig = {
      session: {
        type: "realtime",
        model: "gpt-realtime",
        audio: { output: { voice: "marin" } }
      }
    };

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sessionConfig)
    });

    const data = await r.json();
    // OpenAI guide: client ottaa EPHEMERAL_KEY = data.value :contentReference[oaicite:2]{index=2}
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Failed to mint token", details: String(e) });
  }
}
