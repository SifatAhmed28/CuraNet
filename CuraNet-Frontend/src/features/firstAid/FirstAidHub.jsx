import { AlertTriangle, ArrowRight, HeartPulse, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { firstAidTopics } from "../../data/content";

export default function FirstAidHub() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return firstAidTopics.filter(t => !q || `${t.title} ${t.category} ${t.summary}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="section page-top">
      <div className="container">
        <div className="aid-header">
          <div>
            <div className="pill"><HeartPulse size={15}/> First Aid & Remedies</div>
            <h1>Quick guidance for common situations</h1>
            <p>Use this as an educational reference for basic first-aid measures. It does not diagnose conditions.</p>
          </div>
          <div className="emergency-box"><AlertTriangle/><div><strong>Emergency first</strong><span>If someone is seriously unwell or in immediate danger, contact local emergency services or qualified medical help.</span></div></div>
        </div>

        <div className="searchbox aid-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search first-aid topics..." /></div>

        <div className="aid-grid-large">
          {filtered.map(topic => (
            <Link to={`/first-aid/${topic.id}`} className="aid-card" key={topic.id}>
              <div className="aid-icon">{topic.icon}</div>
              <div className="eyebrow">{topic.category}</div>
              <h3>{topic.title}</h3>
              <p>{topic.summary}</p>
              <span className="text-link">Read measures <ArrowRight size={16}/></span>
            </Link>
          ))}
        </div>

        <div className="safety-strip">
          <ShieldCheck size={22}/>
          <div><strong>Safety reminder</strong><span>First aid can support someone while help is being arranged. Serious, worsening, or unusual symptoms should be assessed by a healthcare professional.</span></div>
        </div>
      </div>
    </section>
  );
}
