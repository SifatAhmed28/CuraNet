import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Droplet,
  Heart,
  Search,
  MapPin,
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Users,
  ShieldCheck,
  RefreshCw,
  X,
  Share2
} from "lucide-react";
import { BLOOD_TYPES, DONORS as FALLBACK_DONORS } from "../../data/donors.js";
import api from "../../utils/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const BANGLADESH_LOCATIONS = [
  "All Bangladesh",
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Bogura",
  "Barisal",
  "Comilla",
  "Jashore",
  "Gazipur",
  "Narayanganj",
  "Sylhet",
  "Mymensingh",
  "Khulna",
];

export default function BloodDonationSection() {
  const { user } = useAuth();

  // Active view: 'requests' | 'donors' | 'post-request' | 'register-donor'
  const [activeView, setActiveView] = useState("requests");

  // Shared Search & Filter States
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Bangladesh");
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Post Request Form State
  const [reqPatientName, setReqPatientName] = useState("");
  const [reqBloodGroup, setReqBloodGroup] = useState("O+");
  const [reqUnits, setReqUnits] = useState("1");
  const [reqHospital, setReqHospital] = useState("");
  const [reqAddress, setReqAddress] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqDate, setReqDate] = useState(() => {
    const d = new Date(Date.now() + 24 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [reqUrgency, setReqUrgency] = useState("medium");
  const [reqDescription, setReqDescription] = useState("");
  const [submittingReq, setSubmittingReq] = useState(false);

  // Register Donor Form State
  const [donorBloodGroup, setDonorBloodGroup] = useState("O+");
  const [donorAddress, setDonorAddress] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorGender, setDonorGender] = useState("male");
  const [donorLastDate, setDonorLastDate] = useState("");
  const [submittingDonor, setSubmittingDonor] = useState(false);

  // Modal contact state
  const [contactedPerson, setContactedPerson] = useState(null);

  // Prefill contact if user is logged in
  useEffect(() => {
    if (user?.name && !reqPatientName) setReqPatientName(user.name);
    if (user?.phone && !reqPhone) setReqPhone(user.phone);
    if (user?.phone && !donorPhone) setDonorPhone(user.phone);
  }, [user]);

  // Fetch Requests and Donors with server-side filters
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError("");

      const reqQuery = new URLSearchParams();
      if (selectedBloodGroup !== "All") reqQuery.set("bloodGroup", selectedBloodGroup);
      if (selectedLocation !== "All Bangladesh") reqQuery.set("location", selectedLocation);
      if (searchQuery.trim()) reqQuery.set("search", searchQuery.trim());
      if (urgencyFilter !== "All") reqQuery.set("urgency", urgencyFilter);

      const donorQuery = new URLSearchParams();
      if (selectedBloodGroup !== "All") donorQuery.set("bloodGroup", selectedBloodGroup);
      if (selectedLocation !== "All Bangladesh") donorQuery.set("location", selectedLocation);
      if (searchQuery.trim()) donorQuery.set("search", searchQuery.trim());
      if (availableOnly) donorQuery.set("available", "true");

      const [statsRes, reqRes, donorsRes] = await Promise.all([
        api.blood.stats().catch(() => ({ data: null })),
        api.blood.requests(reqQuery.toString()).catch(() => ({ data: [] })),
        api.blood.donors(donorQuery.toString()).catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (reqRes?.data) setRequests(reqRes.data);
      if (donorsRes?.data) setDonors(donorsRes.data);
    } catch (err) {
      console.warn("Failed to fetch blood data:", err);
      // Fallback
      setDonors(FALLBACK_DONORS.map(d => ({
        _id: d.id,
        bloodGroup: d.bloodType,
        address: d.location,
        isAvailable: true,
        totalDonations: 3,
        userId: { name: d.name, phone: "+8801700000000" }
      })));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedBloodGroup, selectedLocation, searchQuery, urgencyFilter, availableOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Post Blood Request
  const handlePostRequest = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmittingReq(true);

    try {
      if (!user) {
        setError("Please sign in to post an emergency blood request.");
        setSubmittingReq(false);
        return;
      }

      await api.blood.createRequest({
        patientName: reqPatientName.trim() || user.name || "Emergency Patient",
        bloodGroup: reqBloodGroup,
        unitsNeeded: Number(reqUnits) || 1,
        hospitalName: reqHospital.trim() || "Hospital",
        hospitalAddress: reqAddress.trim() || reqHospital.trim() || "Dhaka",
        contactPhone: reqPhone.trim() || user.phone || "+8801700000000",
        neededByDate: new Date(reqDate).toISOString(),
        urgency: reqUrgency,
        description: reqDescription.trim() || "Urgent blood transfusion required.",
      });

      setMessage("Emergency blood request posted successfully! Volunteers in your area have been alerted.");
      setActiveView("requests");
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to post blood request. Please try again.");
    } finally {
      setSubmittingReq(false);
    }
  };

  // Handle Register as Donor
  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmittingDonor(true);

    try {
      if (!user) {
        setError("Please sign in to register as a volunteer blood donor.");
        setSubmittingDonor(false);
        return;
      }

      await api.blood.registerDonor({
        bloodGroup: donorBloodGroup,
        address: donorAddress.trim() || "Dhaka",
        gender: donorGender,
        lastDonationDate: donorLastDate ? new Date(donorLastDate).toISOString() : new Date().toISOString(),
        phoneVisible: true,
      });

      setMessage("Thank you! You are now registered as an active volunteer blood donor.");
      setActiveView("donors");
      fetchData();
    } catch (err) {
      if (err.message?.includes("already")) {
        setMessage("You are already registered as a donor. Your profile is active.");
        setActiveView("donors");
      } else {
        setError(err.message || "Donor registration failed. Please try again.");
      }
    } finally {
      setSubmittingDonor(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            CRITICAL EMERGENCY
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle size={12} className="text-amber-700" />
            High Urgency
          </span>
        );
      case "low":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Standard
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Medium Priority
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md">
            <Droplet size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Bangladesh Public Blood Exchange &amp; Donor Network
            </h3>
            <p className="text-xs text-slate-500">
              Direct connection between emergency hospital patients and registered volunteer donors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRefreshing && (
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <RefreshCw size={13} className="animate-spin" /> Syncing
            </span>
          )}
          <button
            onClick={() => setActiveView("post-request")}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle size={14} /> Post Request
          </button>
          <button
            onClick={() => setActiveView("register-donor")}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Heart size={14} /> Become Donor
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-emerald-700 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-700 hover:text-rose-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveView("requests")}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeView === "requests"
              ? "bg-rose-700 text-white shadow-md shadow-rose-950/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Droplet size={16} />
          <span>Public Blood Requests</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView("donors")}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeView === "donors"
              ? "bg-teal-800 text-white shadow-md shadow-teal-950/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Users size={16} />
          <span>Volunteer Donors &amp; Applications</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white">
            {donors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView("post-request")}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
            activeView === "post-request"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <PlusCircle size={15} />
          <span>Request Blood</span>
        </button>

        <button
          onClick={() => setActiveView("register-donor")}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
            activeView === "register-donor"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Heart size={15} />
          <span>Donor Registration</span>
        </button>
      </div>

      {/* Search & Filter Bar (Active on Requests & Donors views) */}
      {(activeView === "requests" || activeView === "donors") && (
        <div className="modern-card p-5 rounded-2xl space-y-4 border border-slate-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Search Input */}
            <div className="relative">
              <input
                style={{ paddingLeft: "38px" }}
                className="modern-input text-xs py-2.5 w-full"
                placeholder={
                  activeView === "requests"
                    ? "Search hospital, patient, condition..."
                    : "Search donor name, area..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Location Filter */}
            <div>
              <select
                className="modern-input text-xs py-2.5 cursor-pointer"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {BANGLADESH_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Filter (For Requests) or Availability (For Donors) */}
            {activeView === "requests" ? (
              <div>
                <select
                  className="modern-input text-xs py-2.5 cursor-pointer font-semibold"
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="All">All Urgency Levels</option>
                  <option value="critical">Critical Emergency Only</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Standard Priority</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Available Donors Only</span>
                </label>
              </div>
            )}

            {/* Reset Filters */}
            <div className="flex items-center justify-end">
              {(selectedBloodGroup !== "All" ||
                selectedLocation !== "All Bangladesh" ||
                searchQuery ||
                urgencyFilter !== "All" ||
                availableOnly) && (
                <button
                  onClick={() => {
                    setSelectedBloodGroup("All");
                    setSelectedLocation("All Bangladesh");
                    setSearchQuery("");
                    setUrgencyFilter("All");
                    setAvailableOnly(false);
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Blood Group Quick Select Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
              Blood Group:
            </span>
            <button
              onClick={() => setSelectedBloodGroup("All")}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                selectedBloodGroup === "All"
                  ? "bg-rose-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Types
            </button>
            {BLOOD_TYPES.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedBloodGroup === bg
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/20 scale-105"
                    : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 1: Public Blood Requests List */}
      {activeView === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900 font-bold">{requests.length}</strong> public blood requests
              {selectedBloodGroup !== "All" && ` for ${selectedBloodGroup}`}
              {selectedLocation !== "All Bangladesh" && ` in ${selectedLocation}`}
            </span>
            <span>Sorted by highest urgency</span>
          </div>

          {loading ? (
            <div className="text-center py-20 modern-card rounded-2xl space-y-3">
              <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 font-semibold text-sm">Loading emergency blood requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 modern-card rounded-2xl space-y-3">
              <Droplet size={40} className="mx-auto text-slate-300" />
              <h4 className="font-extrabold text-base text-slate-800">No active blood requests found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No patient requests currently match your selected blood group and location. You can clear filters or post an emergency request.
              </p>
              <button
                onClick={() => setActiveView("post-request")}
                className="mt-2 px-5 py-2.5 bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Post New Blood Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="modern-card modern-card-hover p-5 sm:p-6 rounded-3xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition hover:shadow-md"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Blood Group Badge */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white font-black text-2xl flex flex-col items-center justify-center shadow-lg shadow-rose-950/20 shrink-0">
                      <span>{req.bloodGroup}</span>
                      <span className="text-[10px] font-bold text-rose-200 tracking-wider uppercase">
                        {req.unitsNeeded} {req.unitsNeeded === 1 ? "Unit" : "Units"}
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-lg text-slate-900">{req.patientName}</h4>
                        {getUrgencyBadge(req.urgency)}
                        <span className="text-[11px] font-semibold text-slate-400">
                          Posted by {req.requesterId?.name || "Family"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin size={13} className="text-rose-600 shrink-0" />
                          <span>{req.hospitalName}</span>
                          <span className="text-slate-400 font-normal">({req.hospitalAddress})</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock size={13} className="text-slate-400" />
                          <span>Needed by: {new Date(req.neededByDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                      </div>

                      {req.description && (
                        <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2 shrink-0">
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-glow-rose flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Phone size={14} /> Call {req.contactPhone}
                    </a>
                    <button
                      onClick={() => setContactedPerson({ name: req.patientName, type: "Patient / Requester", phone: req.contactPhone, blood: req.bloodGroup, hospital: req.hospitalName })}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer whitespace-nowrap"
                    >
                      I Want to Donate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Volunteer Donors & Applications List */}
      {activeView === "donors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900 font-bold">{donors.length}</strong> volunteer donors
              {selectedBloodGroup !== "All" && ` with blood group ${selectedBloodGroup}`}
              {selectedLocation !== "All Bangladesh" && ` in ${selectedLocation}`}
            </span>
            <span>Registered volunteers across Bangladesh</span>
          </div>

          {loading ? (
            <div className="text-center py-20 modern-card rounded-2xl space-y-3">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 font-semibold text-sm">Searching registered donors...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-20 modern-card rounded-2xl space-y-3">
              <Users size={40} className="mx-auto text-slate-300" />
              <h4 className="font-extrabold text-base text-slate-800">No registered donors found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No volunteer donors match these criteria. Be the first hero in your area by registering now!
              </p>
              <button
                onClick={() => setActiveView("register-donor")}
                className="mt-2 px-5 py-2.5 bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Register as Volunteer Donor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {donors.map((d) => {
                const name = d.userId?.name || d.name || "Volunteer Donor";
                const phone = d.userId?.phone || d.phone || "+8801700000000";
                const totalDon = d.totalDonations || 1;
                const isAvail = d.isAvailable !== false;

                return (
                  <div
                    key={d._id}
                    className="modern-card modern-card-hover p-5 rounded-3xl border border-slate-200/80 flex flex-col justify-between gap-4 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                          {name[0] || "D"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base text-slate-900">{name}</h4>
                            <span className="p-0.5 text-teal-600" title="Verified Donor">
                              <ShieldCheck size={16} />
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-teal-600" /> {d.address || "Bangladesh"}
                          </p>
                        </div>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                        {d.bloodGroup}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isAvail
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? "bg-emerald-600" : "bg-slate-400"}`} />
                          {isAvail ? "Available to Donate" : "Recently Donated"}
                        </span>
                        <span className="text-slate-400 font-medium">
                          {totalDon} donation{totalDon === 1 ? "" : "s"}
                        </span>
                      </div>

                      <a
                        href={`tel:${phone}`}
                        className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl font-bold flex items-center gap-1 transition"
                      >
                        <Phone size={12} /> Contact
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Post Emergency Blood Request Form */}
      {activeView === "post-request" && (
        <div className="max-w-2xl mx-auto modern-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white">
                <Droplet size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Post Emergency Blood Request</h3>
                <p className="text-xs text-slate-400">Broadcast immediately to donors in your hospital district</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("requests")}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handlePostRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Patient Full Name *
              </label>
              <input
                type="text"
                className="modern-input text-xs py-2.5"
                placeholder="e.g. Mohammad Rahim"
                value={reqPatientName}
                onChange={(e) => setReqPatientName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Blood Group Required *
                </label>
                <select
                  className="modern-input text-xs py-2.5 cursor-pointer font-black text-rose-700"
                  value={reqBloodGroup}
                  onChange={(e) => setReqBloodGroup(e.target.value)}
                >
                  {BLOOD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Units Needed *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="modern-input text-xs py-2.5"
                  value={reqUnits}
                  onChange={(e) => setReqUnits(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hospital Name *
                </label>
                <input
                  className="modern-input text-xs py-2.5"
                  placeholder="e.g. Dhaka Medical College Hospital"
                  value={reqHospital}
                  onChange={(e) => setReqHospital(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hospital Address / District *
                </label>
                <input
                  className="modern-input text-xs py-2.5"
                  placeholder="e.g. Ramna, Dhaka or CMCH, Chittagong"
                  value={reqAddress}
                  onChange={(e) => setReqAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attendant Contact Phone *
                </label>
                <input
                  type="tel"
                  className="modern-input text-xs py-2.5 font-mono"
                  placeholder="e.g. +8801712345678"
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Needed By Date *
                </label>
                <input
                  type="date"
                  className="modern-input text-xs py-2.5"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Level *
              </label>
              <select
                className="modern-input text-xs py-2.5 cursor-pointer font-bold text-slate-800"
                value={reqUrgency}
                onChange={(e) => setReqUrgency(e.target.value)}
              >
                <option value="critical">Critical Emergency (Immediate Surgery)</option>
                <option value="high">High (Within 12-24 Hours)</option>
                <option value="medium">Medium (Within 48 Hours)</option>
                <option value="low">Standard / Planned Surgery</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Medical Reason / Notes (Optional)
              </label>
              <textarea
                rows="2"
                className="modern-input text-xs py-2.5 resize-none"
                placeholder="e.g. Road accident victim undergoing emergency orthopedic surgery."
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submittingReq}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-sm rounded-xl shadow-glow-rose cursor-pointer transition disabled:opacity-50"
            >
              {submittingReq ? "Broadcasting Request..." : "Broadcast Public Blood Request"}
            </button>
          </form>
        </div>
      )}

      {/* VIEW 4: Register as Volunteer Donor Form */}
      {activeView === "register-donor" && (
        <div className="max-w-2xl mx-auto modern-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-teal-700 text-white">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Volunteer Blood Donor Application</h3>
                <p className="text-xs text-slate-400">Join our verified roster and receive direct emergency alerts</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("donors")}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRegisterDonor} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Blood Group *
                </label>
                <select
                  className="modern-input text-xs py-2.5 cursor-pointer font-black text-teal-800"
                  value={donorBloodGroup}
                  onChange={(e) => setDonorBloodGroup(e.target.value)}
                >
                  {BLOOD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  className="modern-input text-xs py-2.5 cursor-pointer font-bold"
                  value={donorGender}
                  onChange={(e) => setDonorGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Area / City / District in Bangladesh *
              </label>
              <input
                type="text"
                className="modern-input text-xs py-2.5"
                placeholder="e.g. Dhanmondi, Dhaka or Agrabad, Chittagong"
                value={donorAddress}
                onChange={(e) => setDonorAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  className="modern-input text-xs py-2.5 font-mono"
                  placeholder="e.g. +8801700000000"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
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
                  value={donorLastDate}
                  onChange={(e) => setDonorLastDate(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-teal-900">
              <p className="font-bold mb-1">Donor Health Criteria:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-teal-800/90 text-[11px]">
                <li>Age 18-60 years and weight &ge; 45 kg</li>
                <li>At least 3 months since your last whole blood donation</li>
                <li>No active fever or major surgery in the last 6 months</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={submittingDonor}
              className="w-full py-3 px-4 btn-gradient text-white font-black text-sm rounded-xl shadow-glow cursor-pointer transition disabled:opacity-50"
            >
              {submittingDonor ? "Registering..." : "Submit Volunteer Application"}
            </button>
          </form>
        </div>
      )}

      {/* Quick Contact Modal */}
      {contactedPerson && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="modern-card p-6 rounded-3xl max-w-md w-full space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-base text-slate-900">Contact {contactedPerson.type}</h4>
              <button onClick={() => setContactedPerson(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                You are connecting with <strong>{contactedPerson.name}</strong> for blood group <strong>{contactedPerson.blood}</strong> at <strong>{contactedPerson.hospital}</strong>.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-center text-slate-900">
                {contactedPerson.phone}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${contactedPerson.phone}`}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl text-center shadow-md"
              >
                Call Now
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(contactedPerson.phone);
                  setMessage(`Copied ${contactedPerson.phone} to clipboard!`);
                  setContactedPerson(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Copy Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
