
import { useState } from 'react';

export default function UniqueJob() {
  const [scene, setScene] = useState("You arrive at Jim Parker's architectural firm on Spring Street. He gestures toward two doors...");
  const [choices, setChoices] = useState([]);
  const [loading, setLoading] = useState(false);

  async function continueStory() {
    setLoading(true);
    const res = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'unique-job', scene })
    });
    const data = await res.json();
    setScene(data.response.scene);
    setChoices(data.response.choices);
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'serif', backgroundColor: '#1a1a1a', color: '#eee' }}>
      <h1>The Unique Job</h1>
      <p>{scene}</p>
      {choices.length > 0 ? (
        <ul>
          {choices.map((choice, index) => (
            <li key={index} style={{ margin: '1rem 0' }}>{choice}</li>
          ))}
        </ul>
      ) : (
        <button onClick={continueStory} disabled={loading} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          {loading ? 'Thinking...' : 'Continue the Story'}
        </button>
      )}
    </div>
  );
}
