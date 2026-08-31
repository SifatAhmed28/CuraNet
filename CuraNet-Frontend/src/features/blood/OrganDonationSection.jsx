import { useMemo, useState } from "react";
import { HeartPulse, HeartHandshake } from "lucide-react";
import { ORGAN_DONORS, ORGAN_TYPES } from "../../data/organs.js";

export default function OrganDonationSection() {
  const [requestOrgan, setRequestOrgan] = useState(ORGAN_TYPES[0]);
  const [showMatches, setShowMatches] = useState(false);
  const [message, setMessage] = useState("");

  const matchingDonors = useMemo(() => ORGAN_DONORS.filter((d) => d.organType === requestOrgan), [requestOrgan]);

  const countByType = useMemo(() => {
    const counts = {};
    ORGAN_TYPES.forEach((t) => (counts[t] = ORGAN_DONORS.filter((d) => d.organType === t).length));
    return counts;
  }, []);

  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginBottom: 20, fontSize: "0.9rem" }}>
        Registered organ and tissue donors, matched by organ type and location.
      </p>

      <div className="type-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {ORGAN_TYPES.map((t) => (
          <div key={t} className="card type-tile">
            <div className="type-label" style={{ fontSize: "0.85rem" }}>{t}</div>
            <div className="type-count">
              {countByType[t]} donor{countByType[t] === 1 ? "" : "s"}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className="notice" style={{ marginBottom: 20, marginTop: 20, background: "var(--clinical-100)", borderColor: "var(--clinical-500)", color: "var(--clinical-900)" }}>
          {message}
        </div>
      )}

      <div className="blood-forms" style={{ marginTop: 20 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowMatches(true);
            setMessage("Organ request posted and matched to registered donors.");
          }}
          className="card"
        >
          <h3 style={{ color: "var(--medical-red)" }}>
            <HeartPulse size={16} /> Request an Organ
          </h3>
          <select className="input" value={requestOrgan} onChange={(e) => setRequestOrgan(e.target.value)}>
            {ORGAN_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input className="input" placeholder="Hospital / transplant center" required />
          <input className="input" placeholder="Patient condition / notes" />
          <button type="submit" className="btn btn-red" style={{ width: "100%" }}>
            Post Request
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage("Thanks — you're registered as an organ donor.");
          }}
          className="card"
        >
          <h3 style={{ color: "var(--clinical-900)" }}>
            <HeartHandshake size={16} /> Register as an Organ Donor
          </h3>
          <select className="input" defaultValue={ORGAN_TYPES[0]}>
            {ORGAN_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input className="input" placeholder="Location" required />
          <input className="input" placeholder="Next of kin contact" />
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Register as Donor
          </button>
        </form>
      </div>

      {showMatches && (
        <div className="card" style={{ overflowX: "auto" }}>
          <h3 style={{ padding: "18px 20px 0" }}>Registered Donors ({requestOrgan})</h3>
          <table className="donor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organ</th>
                <th>Location</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {matchingDonors.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td style={{ color: "var(--medical-red)", fontWeight: 700 }}>{d.organType}</td>
                  <td>{d.location}</td>
                  <td className="mono" style={{ fontSize: "0.78rem" }}>{d.registeredOn}</td>
                  <td>
                    <button onClick={() => setMessage(`Message sent to ${d.name}.`)} className="btn btn-outline" style={{ padding: "6px 14px", fontSize: "0.78rem" }}>
                      Contact
                    </button>
                  </td>
                </tr>
              ))}
              {matchingDonors.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--ink-soft)" }}>
                    No registered donors for this organ yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
