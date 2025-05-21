
export default async function handler(req, res) {
  const { path, scene } = req.body;

  const messages = [
    {
      role: "system",
      content: "You are a narrator for an interactive noir story set in 1919 Los Angeles. Respond with one short scene and two clear, numbered player choices. Do NOT say 'As an AI...'"
    },
    {
      role: "user",
      content: `The player is on the path: ${path}. The last scene was: "${scene}". What happens next? Write one short paragraph, then TWO choices as a bullet list.`
    }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages,
        temperature: 0.8
      })
    });

    const json = await response.json();

    if (!json.choices || !json.choices[0]) {
      console.error("GPT response error:", json);
      return res.status(500).json({ error: "Unexpected OpenAI response", details: json });
    }

    const content = json.choices[0].message.content;

    const parts = content.split(/\n\n|\n- /);
    const sceneText = parts[0];
    const options = parts.slice(1).filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, ''));

    res.status(200).json({
      response: {
        scene: sceneText.trim(),
        choices: options
      }
    });
  } catch (err) {
    console.error("GPT call failed:", err);
    res.status(500).json({ error: "Request to OpenAI failed.", details: err.message });
  }
}
