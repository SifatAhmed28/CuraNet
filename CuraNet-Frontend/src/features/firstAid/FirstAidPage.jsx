import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { IMAGES } from "../../data/images.js";
import { FIRST_AID_TOPICS } from "../../data/firstAid.js";
import PulseIcon from "../../components/PulseIcon.jsx";

export default function FirstAidPage() {
  const [query, setQuery] = useState("");

  const visible = FIRST_AID_TOPICS.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="container section-tight">
      <div className="aid-banner">
        <img src={IMAGES.firstAid} alt="First aid kit with bandages and medical supplies" />
        <div className="aid-banner-text">
          <p className="eyebrow" style={{ color: "#f6d3da" }}>First Aid Measures &amp; Remedies</p>
          <h2>Complete first-aid topic list</h2>
        </div>
      </div>

      <div className="notice" style={{ marginBottom: 20 }}>
        Educational reference only. Serious or worsening symptoms require professional medical help.
      </div>

      <div className="card aid-search" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <Search size={16} color="var(--ink-soft)" />
        <input className="input" style={{ border: "none", padding: "8px 0" }} placeholder="Search first-aid topics..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="aid-grid" style={{ marginTop: 20 }}>
        {visible.map((t) => (
          <Link key={t.id} to={`/first-aid/${t.id}`} className="card aid-card">
            <PulseIcon name={t.icon} size={26} />
            <h4>{t.title}</h4>
            <p>{t.summary}</p>
          </Link>
        ))}
        {visible.length === 0 && <p style={{ color: "var(--ink-soft)" }}>No topics match your search.</p>}
      </div>
    </div>
  );
}
