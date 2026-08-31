import { Link } from "react-router-dom";
import { Stethoscope, Droplet, HeartPulse, ArrowRight, ChevronRight, Star } from "lucide-react";
import StarRating from "../components/StarRating.jsx";
import PulseIcon from "../components/PulseIcon.jsx";
import HeartbeatMonitor from "../components/HeartbeatMonitor.jsx";
import { IMAGES } from "../data/images.js";
import { DOCTORS } from "../data/doctors.js";
import { FIRST_AID_TOPICS } from "../data/firstAid.js";

const MODULES = [
  {
    to: "/doctors",
    title: "Doctor Consultation",
    desc: "Describe your symptoms in plain language and get matched to the right specialist — from cardiology to dentistry.",
    icon: Stethoscope,
    tint: "var(--clinical-100)",
    iconColor: "var(--clinical-700)",
  },
  {
    to: "/blood",
    title: "Blood & Organ Donation",
    desc: "Post an urgent blood or organ request, or register as a donor — matched by type and location.",
    icon: Droplet,
    tint: "var(--medical-red-100)",
    iconColor: "var(--medical-red)",
  },
  {
    to: "/first-aid",
    title: "First Aid Reference",
    desc: "Measures, what to avoid, and when to seek professional help for common emergencies.",
    icon: HeartPulse,
    tint: "var(--gold-100)",
    iconColor: "var(--gold)",
  },
];

export default function HomePage() {
  return (
    <div className="container">
      {/* HERO */}
      <section className="hero">
        <div>
          <p className="eyebrow">One account · Every health decision</p>
          <h1 className="display">
            Find the right care. <br />
            Know what to do next.
          </h1>
          <p>
            CuraNet brings specialist consultation, a blood and organ donor network, and a complete
            first-aid reference together in one place.
          </p>
          <div className="hero-actions">
            <Link to="/doctors" className="btn btn-primary">
              Find a Doctor <ArrowRight size={16} />
            </Link>
            <Link to="/blood" className="btn btn-outline">
              Blood &amp; Organ Donation
            </Link>
          </div>
        </div>
        <div className="hero-photo">
          <img src={IMAGES.doctor} alt="Doctor with a stethoscope" />
          <span className="hero-photo-caption">Doctor Consultation · Blood &amp; Organ Donation · First Aid</span>
          <HeartbeatMonitor bpm={72} className="hero-vitals" />
        </div>
      </section>

      {/* MODULE CARDS */}
      <section className="section-tight">
        <div className="grid-3">
          {MODULES.map((m) => (
            <div key={m.to} className="card module-card">
              <div className="icon-badge" style={{ background: m.tint }}>
                <m.icon size={20} color={m.iconColor} />
              </div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              <Link to={m.to} className="open-link">
                Open <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* VISIBLE FIRST AID SECTION */}
      <section className="section-tight">
        <p className="eyebrow">Separate module</p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 className="display" style={{ margin: 0, fontSize: "1.5rem", color: "var(--clinical-900)" }}>
            First Aid Measures &amp; Remedies List
          </h2>
          <Link to="/first-aid" className="open-link" style={{ color: "var(--medical-red)", fontWeight: 700, fontSize: "0.85rem" }}>
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="notice" style={{ marginBottom: 18 }}>
          Educational reference only. Serious or worsening symptoms require professional medical help.
        </div>
        <div className="aid-grid">
          {FIRST_AID_TOPICS.slice(0, 6).map((t) => (
            <Link key={t.id} to={`/first-aid/${t.id}`} className="card aid-card">
              <PulseIcon name={t.icon} size={26} />
              <h4>{t.title}</h4>
              <p>{t.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP DOCTORS STRIP */}
      <section className="section-tight" style={{ paddingBottom: 60 }}>
        <p className="eyebrow">On the platform</p>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Star size={14} color="var(--gold)" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Top-Rated Specialists</span>
          </div>
          {[...DOCTORS]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4)
            .map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "0.9rem" }}>
                <span>
                  {d.name} <span style={{ color: "var(--ink-soft)", fontSize: "0.8rem" }}>· {d.specialty}</span>
                </span>
                <StarRating value={d.rating} />
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
