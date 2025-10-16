import { useEffect, useState } from "react";

export default function Play() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("drifter");
  const [location, setLocation] = useState("Union Station");
  const [memory, setMemory] = useState({
    morality: 0,
    loyalty: 0,
    notoriety: 0,
  });

  // ✅ Load memory from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lostangels_save");
    if (saved) {
      const data = JSON.parse(saved);
      setRole(data.role);
      setLocation(data.location);
      setMemory(data.memory);
    }
    fetchStory();
  }, []);

  const fetchStory = async (r = role, loc = location, mem = memory) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/generate?role=${r}&location=${loc}`);
      const data = await res.json();
      setStory(data.html);
    } catch (err) {
      setStory("Error loading story.");
    }
    setLoading(false);
  };

  const handleChoice = (event) => {
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

      const saveData = {
        role: newRole,
        location: newLocation,
        memory: newMemory,
      };
      localStorage.setItem("lostangels_save", JSON.stringify(saveData));

      setMemory(newMemory);
      setRole(newRole);
      setLocation(newLocation);
      fetchStory(newRole, newLocation, newMemory);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("lostangels_save");
    setRole("drifter");
    setLocation("Union Station");
    setMemory({ morality: 0, loyalty: 0, notoriety: 0 });
    fetchStory("drifter", "Union Station");
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
      <h1 style={{ fontSize: "1.5rem", color: "#f5b642" }}>
        Lost Angels: Noir Chronicles
      </h1>
      <hr style={{ margin: "1rem 0" }} />
      <div style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
        <strong>Role:</strong> {role} | <strong>Location:</strong> {location} <br />
        🧭 Morality: {memory.morality} | 🤝 Loyalty: {memory.loyalty} | 💀 Notoriety: {memory.notoriety}
        <br />
        <button onClick={handleReset} style={{ marginTop: "0.5rem" }}>
          Restart Story
        </button>
      </div>
      {loading ? (
        <p>Loading your next scene...</p>
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: story }}
          style={{ lineHeight: 1.6 }}
        />
      )}
    </main>
  );
}
