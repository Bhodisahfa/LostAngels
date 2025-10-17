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
