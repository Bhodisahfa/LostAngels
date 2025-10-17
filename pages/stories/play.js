import { useEffect, useState } from "react";

export default function Play() {
  // ---------- STATE ----------
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [memory, setMemory] = useState({ morality: 0, loyalty: 0, notoriety: 0 });
  const [memoryTick, setMemoryTick] = useState(0); // forces re-render when counters change
  const [sceneCount, setSceneCount] = useState(0);
  const [isDev, setIsDev] = useState(false);
  const MAX_FREE_SCENES = 10;

  const roles = [
    { id: "drifter", intro: "Steam rose over the tracks as you stepped off the train with no name and no plan.", location: "Union Station" },
    { id: "architect", intro: "The city was your masterpiece, and the cracks in its marble were starting to show.", location: "City Hall" },
    { id: "detective", intro: "They said the badge was tarnished. You called it well-used.", location: "Police Academy" },
  ];

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "1") {
        setIsDev(true);
        localStorage.setItem("lostangels_dev", "1");
      }
    } catch {}
    if (localStorage.getItem("lostangels_dev") === "1") setIsDev(true);

    const saved = localStorage.getItem("lostangels_save");
    if (saved) {
      const data = JSON.parse(saved);
      setRole(data.role);
      setLocation(data.location);
      setMemory(data.memory);
      setSceneCount(data.sceneCount || 0);
    }
  }, []);

  // ---------- FETCH STORY ----------
  const fetchStory = async (r = role, loc = location, mem = memory, count = sceneCount, lastScene = story) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/generate?role=${r}&location=${loc}&lastScene=${encodeURIComponent(lastScene)}`);
      const data = await res.json();
      setStory(
        data.html ||
          "<p><em>The night goes quiet — the AI hesitated for a moment. Try again.</em></p>"
      );
      setSceneCount(count + 1);
    } catch {
      setStory("<p><em>The night goes quiet — connection lost. Try again.</em></p>");
    }
    setLoading(false);
  };

  // ---------- START ROLE ----------
  const startWithRole = (chosen) => {
    setRole(chosen.id);
    setLocation(chosen.location);
    const introHTML = `<p><em>${chosen.intro}</em></p>`;
    setStory(introHTML);
    localStorage.setItem(
      "lostangels_save",
      JSON.stringify({ role: chosen.id, location: chosen.location, memory, sceneCount: 0 })
    );
    fetchStory(chosen.id, chosen.location, memory, 0, introHTML);
  };

  // ---------- HANDLE CHOICE (Counters + Fetch) ----------
  const handleChoice = (event) => {
    const anchor = event.target.closest("a");
    if (!anchor) return;
    event.preventDefault();
    if (!isDev && sceneCount >= MAX_FREE_SCENES) return;

    const url = new URL(anchor.href);
    const newRole = url.searchParams.get("role") || role;
    const newLocation = url.searchParams.get("location") || location;
    const hrefLower = anchor.textContent.toLowerCase();

    const updatedMemory = { ...memory };
    if (hrefLower.includes("detective") || hrefLower.includes("police")) updatedMemory.morality += 1;
    if (hrefLower.includes("crime") || hrefLower.includes("tunnel")) updatedMemory.morality -= 1;
    if (hrefLower.includes("street") || hrefLower.includes("drifter")) updatedMemory.notoriety += 1;
    if (hrefLower.includes("architect") || hrefLower.includes("union")) updatedMemory.loyalty += 1;

    const newSceneCount = sceneCount + 1;
    const saveData = { role: newRole, location: newLocation, memory: updatedMemory, sceneCount: newSceneCount };
    try { localStorage.setItem("lostangels_save", JSON.stringify(saveData)); } catch {}

    setMemory(updatedMemory);
    setMemoryTick((t) => t + 1); // force visible refresh
    setRole(newRole);
    setLocation(newLocation);
    setSceneCount(newSceneCount);

    setTimeout(() => {
      fetchStory(newRole, newLocation, updatedMemory, newSceneCount);
    }, 100);
  };

  // ---------- RESET ----------
  const handleReset = () => {
    localStorage.removeItem("lostangels_save");
    setRole("");
    setLocation("");
    setMemory({ morality: 0, loyalty: 0, notoriety: 0 });
    setSceneCount(0);
    window.location.reload();
  };

  // ---------- RENDER ----------
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
      <h1 style={{ fontSize: "1.5rem", color: "#f5b642" }}>Lost Angels — Noir Chronicles</h1>
      <hr style={{ margin: "1rem 0" }} />

      <div style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.9 }}>
        <strong>Role:</strong> {role || "—"} | <strong>Location:</strong> {location || "—"} <br />
        🧭 Morality: {memory.morality + memoryTick * 0} | 🤝 Loyalty: {memory.loyalty} | 💀 Notoriety: {memory.notoriety}
        <br />
        📖 Scenes Read: {sceneCount}/{MAX_FREE_SCENES}
        <button
          onClick={handleReset}
          style={{ marginLeft: "0.5rem", background: "#333", color: "#fff" }}
        >
          Restart Story
        </button>
        {isDev && (
          <span
            style={{
              marginLeft: "0.75rem",
              padding: "2px 8px",
              background: "#f5b642",
              color: "#000",
              borderRadius: "4px",
              fontSize: "0.8rem",
            }}
          >
            DEV MODE
          </span>
        )}
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
      ) : !isDev && sceneCount >= MAX_FREE_SCENES ? (
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
