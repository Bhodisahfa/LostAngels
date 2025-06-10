
export default async function handler(req, res) {
  const { path, scene } = req.body;

  const messages = [
    {
      role: "system",
      content: "You are a narrator for a branching noir story set in 1919 Los Angeles. Respond with one immersive paragraph, then TWO player choices as a bullet list (e.g. '- Follow the man', '- Take the alley')."
    },
    {
      role: "user",
      content: `The player is on the path: ${path}. The last scene was: "${scene}". What happens next?`
    }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages,
        temperature: 0.8
      })
    });

    const json = await response.json();

    if (!json.choices || !json.choices[0]?.message?.content) {
      console.error("Invalid GPT response:", json);
      return res.status(500).json({ error: "Unexpected GPT response", raw: json });
    }

    const fullText = json.choices[0].message.content;
    const [sceneText, ...choiceLines] = fullText.split(/\n-\s*/);

    const choices = choiceLines
      .filter(c => c.trim())
      .map(c => c.replace(/^[-*]\s*/, "").trim());

    res.status(200).json({
      response: {
        scene: sceneText.trim(),
        choices: choices.length > 0 ? choices : ["Keep walking", "Double back"]
      }
    });
  } catch (err) {
    console.error("Error calling OpenAI:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}
