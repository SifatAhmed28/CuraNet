import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { FIRST_AID_TOPICS } from "../../data/firstAid.js";
import NotFound from "../../components/NotFound.jsx";
import PulseIcon from "../../components/PulseIcon.jsx";

export default function FirstAidTopicPage() {
  const { topicId } = useParams();
  const topic = FIRST_AID_TOPICS.find((t) => t.id === topicId);

  if (!topic) return <NotFound />;

  return (
    <div className="container section-tight">
      <p style={{ fontSize: "0.8rem", marginBottom: 14 }}>
        <Link to="/first-aid" style={{ color: "var(--clinical-700)", fontWeight: 600 }}>
          ← Back to First Aid
        </Link>
      </p>

      <div className="card" style={{ padding: 28, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <PulseIcon name={topic.icon} size={34} />
          <div>
            <h1 className="display" style={{ margin: 0, fontSize: "1.5rem", color: "var(--clinical-900)" }}>{topic.title}</h1>
            <p style={{ color: "var(--ink-soft)", margin: "4px 0 0" }}>{topic.summary}</p>
          </div>
        </div>
      </div>

      <div className="notice" style={{ margin: "16px 0" }}>
        Educational reference only. Serious or worsening symptoms require professional medical help.
      </div>

      <div className="topic-detail-grid">
        <div className="card">
          <h3 style={{ color: "var(--clinical-700)", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={16} /> Measures to take
          </h3>
          <ul>
            {topic.measures.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 style={{ color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
            <XCircle size={16} /> What to avoid
          </h3>
          <ul>
            {topic.avoid.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "var(--medical-red)" }}>
          <h3 style={{ color: "var(--medical-red)", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} /> When to seek professional help
          </h3>
          <ul>
            {topic.whenToSeekHelp.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
