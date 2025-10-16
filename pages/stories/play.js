import { useEffect, useState } from "react";

export default function Play() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("drifter");
  const [location, setLocation] = useState("Union Station");

  const fetchStory = async (r = role, loc = location) => {
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

  useEffect(() => {
    fetchStory();
  }, []);

  // handle link clicks (like “Go to City Hall”)
  const handleChoice = (event) => {
    if (event.target.tagName === "A") {
      event.preventDefault();
      const url = new URL(event.target.href);
      const newRole = url.searchParams.get("role") || role;
      const newLocation = url.searchParams.get("location") || location;
      setRole(newRole);
      setLocation(newLocation);
      fetchStory(newRole, newLocation);
    }
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
