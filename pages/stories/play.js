import { useEffect, useState } from "react";

export default function Play() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [memory, setMemory] = useState({ morality: 0, loyalty: 0, notoriety: 0 });
  const [sceneCount, setSceneCount] = useState(0);
  const MAX_FREE_SCENES = 10;

  const roles = [
    { id: "drifter", intro: "Steam rose over the tracks as you stepped off the train with no name and no plan.", location: "Union Station" },
    { id: "architect", intro: "The city was your masterpiece, and the cracks in its marble were starting to show.", location: "City Hall" },
    { id: "detective", intro: "They said the badge was tarnished. You called it well-used.", location: "Police Academy" },
  ];

  // Load save or ask for role
  useEffect(() => {
    const saved = localStorage.getItem("lostangels_save");
    if (saved) {
      const data = JSON.parse(saved);
      setRole(data.role);
      setLocation(data.location);
      setMemory(data.memory);
      setSceneCount(data.sceneCount || 0);
    }
  }, []);

  const startWithRole = (chosen) => {
    setRole(chosen.id);
    setLocation(chosen.location);
    setStory(`<p><em>${chosen.intro}</em></p>`);
    localStorage.setItem(
      "lostangels_save",
      JSON.stringify({ role: chosen.id, location: chosen.location, memory, sceneCount: 0 })
    );
    fetchStory(chosen.id, chosen.location);
  };


  const fetchStory = async (r = role, loc = location, mem = memory, count = sceneCount, lastScene = story) => {
  setLoading(true);
  try {
    const res = await fetch(`/api/generate?role=${r}&location=${loc}&lastScene=${encodeURIComponent(lastScene)}`);
    const data = await res.json();
    setStory(data.html);
    setSceneCount(count + 1);
  } catch (err) {
    setStory("Error loading story.");
  }
  setLoading(false);
};


  const handleChoice = (event) => {
    if (sceneCount >= MAX_FREE_SCENES) return; // stop further play when paywall triggers
    if (event.target.tagName === "A") {
      event.preventDefault();
      const url = new URL(event.target.href);
      const newRole = url.searchParams.get("role") || role;
      const newLocation = url.searchParams.get("location") || location;

      let newMemory = { ...memory };
      const href = event.target.href.toLowerCase();
      if (href.includes("police") || href.includes("detective")) newMemory.morality += 1;
      if (href.includes("tunnels") || href.includes("crime")) newMemory.morality -= 1;
      if (href.includes("drifter") || href.includes("street")) newMemory.notoriety += 1;
      if (href.includes("architect") || href.includes("union")) newMemory.loyalty += 1;

      const newSceneCount = sceneCount + 1;
      const saveData = {
        role: newRole,
        location: newLocation,
        memory: newMemory,
        sceneCount: newSceneCount,
      };
      localStorage.setItem("lostangels_save", JSON.stringify(saveData));

      setMemory(newMemory);
      setRole(newRole);
      setLocation(newLocation);
      setSceneCount(newSceneCount);
      fetchStory(newRole, newLocation, newMemory, newSceneCount);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("lostangels_save");
    setRole("");
    setLocation("");
    setMemory({ morality: 0, loyalty: 0, notoriety: 0 });
    setSceneCount(0);
    window.location.reload();
  };

  return (
    <main
      onClick={handleChoice}
      style={{
        padding: "2rem",
        fontFamily: "Georgia, serif",
        background: "#111",
        color: "#eee",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", color: "#f5b642" }}>Lost Angels: Noir Chronicles</h1>
      <hr style={{ margin: "1rem 0" }} />
      <div style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
        <strong>Role:</strong> {role || "unknown"} | <strong>Location:</strong> {location || "unknown"} <br />
        🧭 Morality: {memory.morality} | 🤝 Loyalty: {memory.loyalty} | 💀 Notoriety: {memory.notoriety} <br />
        📖 Current Scene: {sceneCount}/{MAX_FREE_SCENES}{" "}
        <button onClick={handleReset} style={{ marginLeft: "0.5rem" }}>
          Restart Story
        </button>
      </div>


{!role ? (
  <div style={{ textAlign: "center", marginTop: "4rem" }}>
    <h2>Choose your path into Lost Angels</h2>
    {roles.map((r) => (
      <button
        key={r.id}
        onClick={() => startWithRole(r)}
        style={{
          display: "block",
          margin: "1rem auto",
          background: "#f5b642",
          border: "none",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        {r.id.charAt(0).toUpperCase() + r.id.slice(1)}
      </button>
    ))}
  </div>
) : sceneCount >= MAX_FREE_SCENES ? (
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <h2>End of your free journey… for now.</h2>
          <p>
            You’ve walked the alleys of Lost Angels long enough to know there’s more beneath the surface.
          </p>
          <p>Continue your story and unlock deeper paths.</p>
          <button
            onClick={() => alert("Stripe payment popup coming soon")}
            style={{
              marginTop: "1rem",
              background: "#f5b642",
              border: "none",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Unlock Full Access ($5)
          </button>
        </div>
      ) : loading ? (
        <p>Loading your next scene...</p>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: story }} style={{ lineHeight: 1.6 }} />
      )}
    </main>
  );
}
