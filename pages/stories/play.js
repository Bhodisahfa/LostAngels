import { useEffect, useState } from "react";

export default function Play() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("drifter");
  const [location, setLocation] = useState("Union Station");

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/generate?role=${role}&location=${location}`);
        const data = await res.json();
        setStory(data.html);
      } catch (err) {
        setStory("Error loading story.");
      }
      setLoading(false);
    };
    fetchStory();
  }, [role, location]);

  return (
    <main style={{ padding: "2rem", fontFamily: "Georgia, serif", background: "#111", color: "#eee" }}>
      <h1 style={{ fontSize: "1.5rem", color: "#f5b642" }}>Lost Angels: Noir Chronicles</h1>
      <hr style={{ margin: "1rem 0" }} />
      {loading ? (
        <p>Loading your next scene...</p>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: story }} />
      )}
    </main>
  );
}
