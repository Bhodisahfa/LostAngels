export default async function handler(req, res) {
  try {
    const { role = "drifter", location = "Union Station" } = req.query;

    // simple map of next possible locations
    const PLACES = ["Union Station", "Olvera Street", "City Hall", "Police Academy", "Chinatown Tunnels"];
    const nextA = PLACES[(PLACES.indexOf(location) + 1) % PLACES.length];
    const nextB = PLACES[(PLACES.indexOf(location) + 2) % PLACES.length];

    const system = `You are the narrator of a 1919 Los Angeles noir.
Write in an interactive-hybrid style: short vivid lines, replay-friendly.
Keep it ~120–180 words TOTAL.`;

    const user = `Role: ${role}
Location: ${location}
Write a tight scene that advances tension. DO NOT include markdown headings.
DO NOT add code fences.
(Choices will be appended by the app.)`;

    // --- Call OpenAI (best-effort; fine if this fails, we still return choices) ---
    let scene = "";
    try {
      const body = {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.9,
        max_tokens: 300
      };

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (r.ok) {
        const data = await r.json();
        scene = (data.choices?.[0]?.message?.content || "").trim();
      }
    } catch (_) {
      // ignore — we'll fall back
    }

    if (!scene) {
      scene = `Steam sighs. ${location} watches you arrive. You can feel the city choosing for you if you don't choose it first.`;
    }

    // Convert simple newlines to paragraphs
    const clean = scene
      .split(/\n{2,}/)
      .map(p => `<p>${p.replace(/\n/g, " ")}</p>`)
      .join("");

    // Guaranteed choices (always append)
    const choices = `
      <ul>
        <li><a href="/stories/next?role=${encodeURIComponent(role)}&location=${encodeURIComponent(nextA)}">Go to ${nextA}</a></li>
        <li><a href="/stories/next?role=${encodeURIComponent(role)}&location=${encodeURIComponent(nextB)}">Head toward ${nextB}</a></li>
      </ul>
    `;

    return res.status(200).json({ html: clean + choices });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
}
