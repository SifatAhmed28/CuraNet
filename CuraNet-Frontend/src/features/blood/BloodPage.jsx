import { useState } from "react";
import { IMAGES } from "../../data/images.js";
import BloodDonationSection from "./BloodDonationSection.jsx";
import OrganDonationSection from "./OrganDonationSection.jsx";

const TABS = [
  { id: "blood", label: "Blood Donation" },
  { id: "organ", label: "Organ Donation" },
];

export default function BloodPage() {
  const [tab, setTab] = useState("blood");
  const isBlood = tab === "blood";

  return (
    <div className="container section-tight">
      <div className="blood-banner">
        <img src={isBlood ? IMAGES.blood : IMAGES.organ} alt={isBlood ? "Blood donation bag" : "Human heart illustration"} />
        <div className="blood-banner-text">
          <p className="eyebrow" style={{ color: "#f6d3da" }}>Blood &amp; Organ Donation</p>
          <h2>{isBlood ? "Every unit matters. Every minute matters." : "The gift of life, given and received."}</h2>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? "var(--clinical-900)" : "var(--clinical-100)",
              color: tab === t.id ? "#fff" : "var(--clinical-900)",
              border: "none",
              borderRadius: 999,
              padding: "8px 18px",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isBlood ? <BloodDonationSection /> : <OrganDonationSection />}
    </div>
  );
}
