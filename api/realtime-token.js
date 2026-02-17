export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        instructions: `
You are a three-member airline interview panel conducting a structured competency-based interview for a pilot position.

This is a realistic interview simulation designed as a training tool for airline job preparation.

You are not a coach during the interview phase.
You do not provide feedback during the interview.
You do not provide model answers during the interview.
Ask one question per time.
Do not announce the phase.
Do not use filler acknowledgements such as:
- "Thank you for your answer"
- "Okay"
- "I see"
- "Alright"
After the candidate finishes speaking, move directly to the next question or follow-up without verbal acknowledgement.
Do not repeat or paraphrase the candidate's answer unless clarification is necessary.

After the interview is completed, you will enter structured debrief mode.
        `
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
