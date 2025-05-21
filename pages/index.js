
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "serif", backgroundColor: "#111", color: "#eee" }}>
      <h1>Tunnels of Lost Angels</h1>
      <p>Los Angeles, 1919. The city is growing fast — too fast. Beneath it, tunnels stretch like veins through shadow and stone. They carry secrets, liquor, and bodies.</p>
      <p>You just arrived. Do you...</p>
      <ul>
        <li><Link href="/unique-job">Take the Unique Job (no questions asked)</Link></li>
        <li><Link href="/assistant-detective">Become the Assistant Detective (truth is dangerous)</Link></li>
      </ul>
    </div>
  );
}
