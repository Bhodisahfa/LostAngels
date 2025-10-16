export default async function handler(req, res) {
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

  const apiKey = process.env.OPENAI_API_KEY;

  // retry helper
  async function getCompletion(attempt = 1) {
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

    if (!response.ok) {
      if (attempt < 2) return getCompletion(attempt + 1); // try again once
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const scene = data?.choices?.[0]?.message?.content?.trim();

    if (!scene || scene.length < 20) {
      if (attempt < 2) return getCompletion(attempt + 1);
      throw new Error("Empty or invalid story content.");
    }

    return scene;
  }

  try {
    const scene = await getCompletion();
    res.status(200).json({ html: scene });
  } catch (err) {
    res.status(200).json({
      html: `<p><em>The night goes quiet — the AI hesitated for a moment. Try another path.</em></p>`,
    });
  }
}
