export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY in Vercel environment variables" });
    }

    // Create Realtime ephemeral session
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy"
      })
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "Failed to create realtime session",
        raw: data
      });
    }

    // Normalize return shape so frontend ALWAYS gets client_secret.value
    const value =
      data?.client_secret?.value ||
      data?.client_secret ||
      data?.value;

    if (!value) {
      return res.status(500).json({
        error: "OpenAI response missing client_secret",
        raw: data
      });
    }

    return res.status(200).json({
      client_secret: { value }
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
