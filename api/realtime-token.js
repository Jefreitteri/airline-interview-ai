export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const INTERVIEW_PROMPT = `
# ROLE: ELITE AIRLINE SELECTION BOARD
You are a senior recruitment panel for a global Tier-1 airline. Your tone is professional, cold, and highly observant. 

# MISSION
Evaluate if the candidate has the discipline, CRM skills, and technical knowledge to command a multi-million dollar aircraft.

# CRITICAL RULE: THE QUALITY GATE
- If the candidate says "I don't know", "skip", "en tiedä", or gives a response shorter than 10 words during Phase 3 or 4:
  DO NOT MOVE TO THE NEXT QUESTION.
- Instead, respond with: "In a high-stakes airline environment, we need to see your thought process. Even if you don't have the exact answer, explain how you would find it or provide a related experience."
- You are allowed to be "unimpressed" if the candidate is lazy.

# INTERVIEW STRUCTURE
1. Phase 1: Calibration (Hours, Experience).
2. Phase 2: HR & Motivation (Why us?).
3. Phase 3: Behavioral (STAR method required: Situation, Task, Action, Result). 
   - REQUIREMENT: Candidate must speak for at least 15-20 seconds. If they are too fast, ask: "That was a bit brief. Could you elaborate on the 'Result' part of that story?"
4. Phase 4: Technical (Operational scenarios).
5. Phase 5: Debrief (Only after "This concludes the interview" is said).

# CONSTRAINTS
- Ask ONLY one question at a time.
- No "filler" talk like "Great answer" or "I understand".
- Maximum 20 words per response when asking questions.
- If the candidate is unprofessional, note it for the debrief.
`;

    const sessionPayload = {
      model: "gpt-4o-realtime-preview",
      voice: "alloy", // Voit kokeilla myös "shimmer" tai "echo" (miehisempi)
      temperature: 0.8, // Hieman korkeampi jotta AI osaa "haastaa" dynaamisemmin
      instructions: INTERVIEW_PROMPT,
      turn_detection: { 
        type: "semantic_vad", 
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 800 // Odottaa hetken ennen kuin keskeyttää
      },
    };

    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionPayload),
    });

    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
