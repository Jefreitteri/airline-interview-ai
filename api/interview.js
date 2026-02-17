export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // Vercelissä req.body voi olla string tai undefined
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});

    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing 'messages' array in body." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on server." });
    }

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n"),
      }),
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok) {
      return res.status(r.status).json({
        error: "OpenAI API error",
        status: r.status,
        details: data,
      });
    }

    // Palautetaan frontille selkeä teksti
    const outputText =
      data.output_text ||
      (data.output?.[0]?.content?.[0]?.text) ||
      "";

    return res.status(200).json({ text: outputText, raw: data });
  } catch (err) {
    return res.status(500).json({
      error: "Server crashed",
      message: err?.message || String(err),
    });
  }
}
