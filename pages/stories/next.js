import { useRouter } from "next/router";

export default function NextChapter() {
  const { query } = useRouter();
  const role = (query.role || "drifter").toString();
  const location = (query.location || "Union Station").toString();

  const line =
    role === "architect"
      ? "Blueprints don’t match the foundation. Someone changed your lines."
      : role === "detective"
      ? "The file is thin and the money is thick. Someone wants this quiet."
      : "A porter eyes your suitcase. The city eyes you back.";

  return (
    <main style={{maxWidth:720, margin:"40px auto", lineHeight:1.6, fontFamily:"system-ui, sans-serif"}}>
      <h1>Lost Angels — Chapter 2</h1>
      <p><b>Role:</b> {role}</p>
      <p><b>Location:</b> {location}</p>
      <p>{line}</p>
      <ul>
        <li><a href="/stories/arrival">← Back to Arrival</a></li>
        <li><a href={`/stories/next?role=${role}&location=${encodeURIComponent(location)}`}>Refresh this scene</a></li>
      </ul>
      <p style={{marginTop:24, fontSize:14, opacity:.8}}>
        (Placeholder dynamic page — we’ll swap this for AI-generated text next.)
      </p>
    </main>
  );
}
