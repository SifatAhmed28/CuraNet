import { AlertTriangle, ArrowLeft, CheckCircle2, HeartPulse, ShieldAlert } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { firstAidTopics } from "../../data/content";

export default function FirstAidDetails() {
  const { topicId } = useParams();
  const topic = firstAidTopics.find(t => t.id === topicId);

  if (!topic) return <div className="container not-found"><h2>Topic not found</h2><Link to="/first-aid">Back to First Aid</Link></div>;

  return (
    <section className="section page-top">
      <div className="container narrow">
        <Link to="/first-aid" className="back-link"><ArrowLeft size={16}/> Back to First Aid</Link>

        <div className="aid-detail-hero">
          <div className="aid-icon big">{topic.icon}</div>
          <div><div className="eyebrow">{topic.category}</div><h1>{topic.title}</h1><p>{topic.summary}</p></div>
        </div>

        <div className="warning-banner"><AlertTriangle/><div><strong>Educational reference only</strong><span>This page provides general first-aid information. It is not a diagnosis or a replacement for professional medical care.</span></div></div>

        <div className="aid-detail-card">
          <div className="detail-section">
            <h2><CheckCircle2/> Basic measures</h2>
            <ol>{topic.measures.map(item => <li key={item}>{item}</li>)}</ol>
          </div>
          <div className="detail-section avoid">
            <h2><ShieldAlert/> Avoid</h2>
            <ul>{topic.avoid.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="seek-help">
            <HeartPulse/>
            <div><strong>When to seek medical help</strong><p>{topic.seek}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
