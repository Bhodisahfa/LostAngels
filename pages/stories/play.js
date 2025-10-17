// --- CLICK HANDLER (robust counters + proper re-render) ---
const handleChoice = (event) => {
  const anchor = event.target.closest && event.target.closest("a");
  if (!anchor) return;
  event.preventDefault();

  if (!isDev && sceneCount >= MAX_FREE_SCENES) return;

  const url = new URL(anchor.href);
  const newRole = url.searchParams.get("role") || role;
  const newLocation = url.searchParams.get("location") || location;
  const hrefLower = anchor.href.toLowerCase();

  // calculate new memory values
  const updatedMemory = { ...memory };

  if (hrefLower.includes("police") || hrefLower.includes("detective"))
    updatedMemory.morality = (updatedMemory.morality || 0) + 1;
  if (hrefLower.includes("tunnels") || hrefLower.includes("crime"))
    updatedMemory.morality = (updatedMemory.morality || 0) - 1;
  if (hrefLower.includes("drifter") || hrefLower.includes("street"))
    updatedMemory.notoriety = (updatedMemory.notoriety || 0) + 1;
  if (hrefLower.includes("architect") || hrefLower.includes("union"))
    updatedMemory.loyalty = (updatedMemory.loyalty || 0) + 1;

  // increment scene count
  const newSceneCount = sceneCount + 1;

  // save game state
  const saveData = {
    role: newRole,
    location: newLocation,
    memory: updatedMemory,
    sceneCount: newSceneCount,
  };
  try {
    localStorage.setItem("lostangels_save", JSON.stringify(saveData));
  } catch (e) {}

  // update React state separately (forces proper re-render)
  setMemory(updatedMemory);
  setRole(newRole);
  setLocation(newLocation);
  setSceneCount(newSceneCount);

  // fetch next story *after* state updates
  setTimeout(() => {
    fetchStory(newRole, newLocation, updatedMemory, newSceneCount);
  }, 50);
};
  // === RESET ===
  const handleReset = () => {
    localStorage.removeItem("lostangels_save");
    setRole("");
    setLocation("");
    setMemory({ morality: 0, loyalty: 0, notoriety: 0 });
    setSceneCount(0);
    window.location.reload();
  };

  // === RENDER ===
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

      <div style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.9 }}>
        <strong>Role:</strong> {role || "—"} | <strong>Location:</strong> {location || "—"} <br />
        🧭 Morality: {memory.morality} | 🤝 Loyalty: {memory.loyalty} | 💀 Notoriety: {memory.notoriety}
        <br />
        📖 Scenes Read: {sceneCount}/{MAX_FREE_SCENES}
        <button onClick={handleReset} style={{ marginLeft: "0.5rem", background: "#333", color: "#fff" }}>
          Restart Story
        </button>
        {isDev && (
          <span style={{ marginLeft: "0.75rem", padding: "2px 8px", background: "#f5b642", color: "#000", borderRadius: "4px", fontSize: "0.8rem" }}>
            DEV MODE
          </span>
        )}
      </div>

      {!role ? (
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <h2>Choose your path into Lost Angels</h2>
          {[
            { id: "drifter", label: "Drifter" },
            { id: "architect", label: "Architect" },
            { id: "detective", label: "Detective" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() =>
                startWithRole({
                  id: r.id,
                  intro: "Loading intro...",
                  location: r.id === "architect" ? "City Hall" : r.id === "detective" ? "Police Academy" : "Union Station",
                })
              }
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
              {r.label}
            </button>
          ))}
        </div>
      ) : !isDev && sceneCount >= MAX_FREE_SCENES ? (
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <h2>End of your free journey… for now.</h2>
          <p>You’ve walked the alleys of Lost Angels long enough to know there’s more beneath the surface.</p>
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

