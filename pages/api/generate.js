export default async function handler(req, res) {
  try {
    const { role = "drifter", location = "Union Station", lastScene = "" } = req.query;

    const system = `You are the narrator of a 1919 Los Angeles noir story.
Write a short, vivid scene (under 200 words) that continues the player's journey.
Tone: gritty, immersive, atmospheric. No Markdown headings or code fences.`;

    const user = `
Role: ${role}
Current location: ${location}
Previous scene: ${lastScene || "This is the start of the journey."}

Write the next moment in the story, and then propose TWO possible actions or directions.
Make them natural to the events, not random.
Return pure HTML (paragraphs and <ul><li><a href=...>choice</a></li></ul> only).`;

    // 🔑 Use your OpenAI API key securely from environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 300,
        temperature: 0.9,
      }),
    });

    const data = await response.json();
    const scene = data.choices?.[0]?.message?.content || "The streets are silent tonight...";
    res.status(200).json({ html: scene });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
