export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY in env" });
  }

  // IMPORTANT: This returns an ephemeral client_secret for WebRTC usage.
  // Docs: create client secret for Realtime + then create a Realtime call from the browser.
  //

  const body = {
    session: {
      model: "gpt-4o-realtime-preview",
      // voice is configured on the session in some setups; if your account supports it,
      // you can also set a voice here. If not, it will use default voice.
      // voice: "alloy",

      // Strongly recommended for interview flow: server VAD (model decides when you finished talking).
      turn_detection: { type: "server_vad" },
    },
  };

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: "OpenAI error creating client_secret",
        details: data,
      });
    }

    // We return the full object, and the browser reads client_secret.value
    //
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
