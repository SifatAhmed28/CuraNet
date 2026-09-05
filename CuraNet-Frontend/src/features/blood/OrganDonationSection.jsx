import { useMemo, useState } from "react";
import { HeartPulse, HeartHandshake, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ORGAN_DONORS, ORGAN_TYPES } from "../../data/organs.js";

export default function OrganDonationSection() {
  const [requestOrgan, setRequestOrgan] = useState(ORGAN_TYPES[0]);
  const [showMatches, setShowMatches] = useState(false);
  const [message, setMessage] = useState("");

  const matchingDonors = useMemo(
    () => ORGAN_DONORS.filter((d) => d.organType === requestOrgan),
    [requestOrgan]
  );

  const countByType = useMemo(() => {
    const counts = {};
    ORGAN_TYPES.forEach(
      (t) => (counts[t] = ORGAN_DONORS.filter((d) => d.organType === t).length)
    );
    return counts;
  }, []);

  return (
    <div className="space-y-8">
      <p className="text-slate-500 text-sm">
        Registered organ and tissue donors across specialized hospitals, matched by organ type and clinical eligibility.
      </p>

      {/* Organ Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {ORGAN_TYPES.map((t) => (
          <div
            key={t}
            onClick={() => setRequestOrgan(t)}
            className={`p-4 text-center rounded-2xl border transition-all cursor-pointer ${
              requestOrgan === t
                ? "bg-rose-50 border-rose-500 shadow-sm"
                : "bg-white border-slate-100 hover:border-slate-300"
            }`}
          >
            <div className="text-sm font-black text-rose-700 mb-1">{t}</div>
            <div className="text-xs font-semibold text-slate-500">
              {countByType[t] ?? 0} donor{(countByType[t] ?? 0) === 1 ? "" : "s"}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Two-Column Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Organ Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowMatches(true);
            setMessage("Organ clinical request posted and matched to registered donor records.");
          }}
          className="modern-card p-6 sm:p-7 rounded-3xl space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <HeartPulse size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Request Organ Transplant</h3>
              <p className="text-xs text-slate-400">Hospital registry matching</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Required Organ / Tissue
            </label>
            <select
              className="modern-input text-xs py-2.5 cursor-pointer font-bold text-rose-700 w-full"
              value={requestOrgan}
              onChange={(e) => setRequestOrgan(e.target.value)}
            >
              {ORGAN_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hospital / Transplant Center
            </label>
            <input
              className="modern-input text-xs py-2.5 w-full"
              placeholder="e.g. BSMMU Transplant Wing, Dhaka"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Clinical Notes
            </label>
            <input
              className="modern-input text-xs py-2.5 w-full"
              placeholder="e.g. Stage 4 CKD, blood group B+"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm rounded-xl shadow-glow-rose cursor-pointer transition transform hover:-translate-y-0.5"
          >
            Submit Transplant Matching Request
          </button>
        </form>

        {/* Register as Organ Donor Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage("Thank you — your organ donor pledge has been recorded in the national registry.");
          }}
          className="modern-card p-6 sm:p-7 rounded-3xl space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <HeartHandshake size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Pledge as an Organ Donor</h3>
              <p className="text-xs text-slate-400">Give the gift of life</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Organ / Tissue to Pledge
            </label>
            <select className="modern-input text-xs py-2.5 cursor-pointer font-bold text-teal-800 w-full" defaultValue={ORGAN_TYPES[0]}>
              {ORGAN_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              City / District
            </label>
            <input className="modern-input text-xs py-2.5 w-full" placeholder="e.g. Gulshan, Dhaka" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Next of Kin Contact &amp; Consent
            </label>
            <input className="modern-input text-xs py-2.5 w-full" placeholder="e.g. +8801700000000 (Spouse/Parent)" required />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 btn-gradient text-white font-bold text-sm rounded-xl shadow-glow cursor-pointer transition transform hover:-translate-y-0.5"
          >
            Register Donor Pledge
          </button>
        </form>
      </div>

      {/* Matched Donors Table */}
      {showMatches && (
        <div className="modern-card p-6 rounded-3xl overflow-x-auto">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-rose-600" />
            Registered Donors Available for {requestOrgan}
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Donor Code / Name</th>
                <th className="py-3 px-4">Organ Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {matchingDonors.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                  <td className="py-3 px-4 font-extrabold text-rose-600">{d.organType}</td>
                  <td className="py-3 px-4 text-slate-500">{d.location}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{d.registeredOn}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setMessage(`Confidential notification sent to donor coordinator for ${d.name}.`)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition cursor-pointer"
                    >
                      Contact Coordinator
                    </button>
                  </td>
                </tr>
              ))}
              {matchingDonors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No registered donors found for this organ yet.
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
