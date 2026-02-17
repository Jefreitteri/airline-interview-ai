export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: "gpt-realtime"
      }
    })
  });

  const data = await r.json();
  res.status(200).json(data);
}
