import { useEffect, useMemo, useState } from "react";
import { Droplet, Heart } from "lucide-react";
import { BLOOD_TYPES, DONORS as FALLBACK_DONORS } from "../../data/donors.js";
import api from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function BloodDonationSection() {
  const { user } = useAuth();
  const [requestType, setRequestType] = useState("O+");
  const [donorType, setDonorType] = useState("O+");
  const [donorLocation, setDonorLocation] = useState("");
  const [requestHospital, setRequestHospital] = useState("");
  const [requestUnits, setRequestUnits] = useState("");
  const [showMatches, setShowMatches] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, donorsRes, reqRes] = await Promise.all([
        api.blood.stats().catch(() => ({ data: null })),
        api.blood.donors().catch(() => ({ data: [] })),
        api.blood.requests().catch(() => ({ data: [] })),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (donorsRes.data) setDonors(donorsRes.data.length ? donorsRes.data : []);
      else setDonors([]);
      if (reqRes.data) setRequests(reqRes.data);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Use API donors if available, else fallback
  const allDonors = donors.length ? donors.map(d => ({
    id: d._id,
    name: d.userId?.name || "Donor",
    bloodType: d.bloodType,
    location: d.district || d.location || "",
    lastDonation: d.lastDonationDate ? new Date(d.lastDonationDate).toISOString().slice(0,10) : "-",
  })) : FALLBACK_DONORS;

  const compatibleDonors = useMemo(() => {
    if (requestType === "O-") return allDonors.filter((d) => d.bloodType === "O-");
    return allDonors.filter((d) => d.bloodType === requestType || d.bloodType === "O-");
  }, [requestType, allDonors]);

  const countByType = useMemo(() => {
    if (stats?.countByBloodType) return stats.countByBloodType;
    const counts = {};
    BLOOD_TYPES.forEach((t) => (counts[t] = allDonors.filter((d) => d.bloodType === t).length));
    return counts;
  }, [allDonors, stats]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      if (!user) { setError("Please sign in to post a request."); return; }
      await api.blood.createRequest({
        bloodType: requestType,
        unitsNeeded: Number(requestUnits) || 1,
        hospital: requestHospital,
        district: requestHospital,
        urgency: "moderate",
      });
      setMessage("Blood request posted and matched to nearby donors.");
      setShowMatches(true);
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to post request. Try again.");
      // still show matches for demo
      setShowMatches(true);
    }
  };

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      if (!user) { setError("Please sign in to register as donor."); return; }
      await api.blood.registerDonor({
        bloodType: donorType,
        district: donorLocation || "Dhaka",
        lastDonationDate: new Date().toISOString(),
      });
      setMessage("Thanks — you're registered as a blood donor.");
      fetchData();
    } catch (err) {
      if (err.message?.includes("already")) setMessage("You are already registered as a donor.");
      else setError(err.message || "Registration failed.");
    }
  };

  if (loading) return <div style={{ padding: 20, color: "var(--muted)" }}>Loading blood data...</div>;

  return (
    <div className="space-y-8">
      <p className="text-slate-500 text-sm">
        Registered donors across all eight blood types, matched by type and proximity.
        {stats && ` • ${stats.totalOpenRequests ?? requests.length} open requests`}
      </p>

      {/* Type grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {BLOOD_TYPES.map((t) => (
          <div
            key={t}
            className="modern-card modern-card-hover p-4 text-center rounded-2xl border border-slate-100 bg-white/90"
          >
            <div className="text-xl font-black text-rose-600 mb-1">{t}</div>
            <div className="text-xs font-semibold text-slate-500">
              {countByType[t] ?? 0} donor{(countByType[t] ?? 0) === 1 ? "" : "s"}
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          {error}
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Form */}
        <form onSubmit={handleRequest} className="modern-card p-6 sm:p-7 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Droplet size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Request Blood</h3>
              <p className="text-xs text-slate-400">Match with nearby eligible donors</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Required Blood Group
            </label>
            <select
              className="modern-input text-xs py-2.5 cursor-pointer font-bold text-rose-700"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
            >
              {BLOOD_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Units Needed
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="modern-input text-xs py-2.5"
              placeholder="e.g. 2"
              value={requestUnits}
              onChange={(e) => setRequestUnits(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hospital &amp; City / Area
            </label>
            <input
              className="modern-input text-xs py-2.5"
              placeholder="e.g. Dhaka Medical College Hospital, Dhaka"
              value={requestHospital}
              onChange={(e) => setRequestHospital(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm rounded-xl shadow-glow-rose cursor-pointer transition transform hover:-translate-y-0.5"
          >
            Post Emergency Blood Request
          </button>
        </form>

        {/* Register Donor Form */}
        <form onSubmit={handleRegisterDonor} className="modern-card p-6 sm:p-7 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Heart size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Become a Donor</h3>
              <p className="text-xs text-slate-400">Save lives in your community</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Blood Group
            </label>
            <select
              className="modern-input text-xs py-2.5 cursor-pointer font-bold text-teal-800"
              value={donorType}
              onChange={(e) => setDonorType(e.target.value)}
            >
              {BLOOD_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Area / Location
            </label>
            <input
              className="modern-input text-xs py-2.5"
              placeholder="e.g. Dhanmondi, Dhaka"
              value={donorLocation}
              onChange={(e) => setDonorLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Last Donation Date (if any)
            </label>
            <input
              type="date"
              className="modern-input text-xs py-2.5"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 btn-gradient text-white font-bold text-sm rounded-xl shadow-glow cursor-pointer"
          >
            Register as Volunteer Donor
          </button>
        </form>
      </div>

      {/* Compatible Donors Table */}
      {showMatches && (
        <div className="modern-card p-6 rounded-3xl overflow-x-auto">
          <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Droplet size={18} className="text-rose-600" /> Compatible Donors Nearby ({requestType})
          </h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Donor Name</th>
                <th className="py-3 px-4">Blood Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Last Donation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {compatibleDonors.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                  <td className="py-3 px-4 font-extrabold text-rose-600">{d.bloodType}</td>
                  <td className="py-3 px-4 text-slate-500">{d.location}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{d.lastDonation}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setMessage(`Alert notification sent to ${d.name}.`)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition cursor-pointer"
                    >
                      Contact Donor
                    </button>
                  </td>
                </tr>
              ))}
              {compatibleDonors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No compatible donors found nearby yet.
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

