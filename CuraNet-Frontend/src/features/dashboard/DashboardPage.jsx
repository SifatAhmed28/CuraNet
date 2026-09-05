import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BookOpen,
  Calendar,
  Droplet,
  Heart,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Clock3,
  User as UserIcon,
  HeartHandshake,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import VerificationModal from "../../components/VerificationModal";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import DoctorDashboardView from "./DoctorDashboardView.jsx";
import AdminDashboardView from "./AdminDashboardView.jsx";
import EditProfileModal from "../../components/EditProfileModal.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [bloodStats, setBloodStats] = useState(null);
  const [myDonor, setMyDonor] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [adminViewMode, setAdminViewMode] = useState("admin");

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      setCancellingId(apptId);
      await api.appointments.cancel(apptId).catch(() => api.appointments.update(apptId, { status: "cancelled" }));
      setAppointments(prev => prev.map(a => a._id === apptId ? { ...a, status: "cancelled", paymentStatus: a.paymentStatus === "paid" ? "refunded" : a.paymentStatus } : a));
      setCancelMessage("Appointment has been cancelled successfully.");
      setTimeout(() => setCancelMessage(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, statsRes, donorRes, reqsRes] = await Promise.all([
          api.appointments.list().catch(() => ({ data: [] })),
          api.blood.stats().catch(() => ({ data: null })),
          api.blood.myDonorProfile().catch(() => ({ data: null })),
          api.blood.myRequests().catch(() => ({ data: [] })),
        ]);
        setAppointments(apptRes.data || []);
        setBloodStats(statsRes.data);
        setMyDonor(donorRes?.data || null);
        setMyRequests(reqsRes?.data || []);

        try {
          const enrollRes = await api.courses.myEnrollments();
          setEnrollments(enrollRes.data || []);
        } catch {
          /* not enrolled */
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const upcomingAppts = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  );
  const completedAppts = appointments.filter((a) => a.status === "completed");

  if (loading) {
    return (
      <section className="section page-top">
        <div className="container" style={{ textAlign: "center", padding: 80, color: "var(--muted)" }}>
          <Activity size={28} className="pulse-icon" />
          <p>Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  // 1. Doctor Dashboard View
  if (user?.role === "doctor" || (user?.role === "admin" && adminViewMode === "doctor")) {
    return (
      <section className="section page-top">
        <div className="container space-y-4">
          {user?.role === "admin" && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">Admin Mode: Previewing Doctor Console</span>
              <button
                onClick={() => setAdminViewMode("admin")}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Back to Admin Console
              </button>
            </div>
          )}
          <DoctorDashboardView user={user} />
        </div>
      </section>
    );
  }

  // 2. Admin Dashboard View
  if (user?.role === "admin" && adminViewMode === "admin") {
    return (
      <section className="section page-top">
        <div className="container space-y-6">
          <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-2xl shadow-sm">
            <span className="text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Admin Root Privileges · Role Previews:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdminViewMode("doctor")}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg cursor-pointer transition"
              >
                Preview Doctor Console
              </button>
              <button
                onClick={() => setAdminViewMode("patient")}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg cursor-pointer transition"
              >
                Preview Patient View
              </button>
            </div>
          </div>
          <AdminDashboardView user={user} />
        </div>
      </section>
    );
  }

  return (
    <section className="section page-top">
      <div className="container">
        {user?.role === "admin" && adminViewMode === "patient" && (
          <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900">Admin Mode: Previewing Patient View</span>
            <button
              onClick={() => setAdminViewMode("admin")}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Back to Admin Console
            </button>
          </div>
        )}
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow">DASHBOARD</div>
            <h1 style={{ fontSize: 38, margin: "8px 0" }}>
              Welcome, {user?.name?.split(" ")[0] || "User"} 👋
            </h1>
            <p style={{ color: "var(--muted)" }}>
              Your personal health overview — appointments, courses, and more.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl shadow-sm text-xs font-extrabold transition cursor-pointer"
            >
              <UserIcon size={15} />
              <span>Edit Profile</span>
            </button>

            {user?.isVerified ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl shadow-sm text-xs font-extrabold">
                <ShieldCheck size={18} className="text-emerald-600" />
                Verified CuraNet Identity
              </div>
            ) : (
              <button
                onClick={() => setShowVerify(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 rounded-2xl shadow-sm text-xs font-extrabold transition cursor-pointer"
              >
                <ShieldAlert size={18} className="text-amber-600" />
                Verify Account
              </button>
            )}
          </div>
        </div>

        <VerificationModal isOpen={showVerify} onClose={() => setShowVerify(false)} />
        <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />


        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Calendar, label: "Upcoming", value: upcomingAppts.length, color: "var(--teal)" },
            { icon: CheckCircle2, label: "Completed", value: completedAppts.length, color: "#4aa88a" },
            { icon: BookOpen, label: "Courses", value: enrollments.length, color: "#6b5ce7" },
            {
              icon: Droplet,
              label: "Open Requests",
              value: bloodStats?.totalOpenRequests || 0,
              color: "#d94452",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="content-card flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${s.color}18`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }} className="truncate">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments */}
          <div className="content-card p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Stethoscope size={18} className="text-teal-700" />
                <span>My Appointments</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {appointments.length}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <Link to="/doctors" className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1">
                  <span>Book new</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {cancelMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{cancelMessage}</span>
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Calendar size={32} className="mx-auto opacity-40 text-slate-400" />
                <p className="text-sm font-semibold text-slate-600">No appointments booked yet</p>
                <p className="text-xs text-slate-400">Search over 6,500+ verified specialists across Bangladesh.</p>
                <Link to="/doctors" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline pt-2">
                  <span>Find a doctor</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((a) => {
                  const docName = a.doctorId?.name || a.doctorUserId?.name || "Specialist Doctor";
                  const docSpecialty = a.doctorId?.specialization?.[0] || a.ruleMatchMeta?.matchedSpecialty || "Specialist";
                  const chamber = a.doctorId?.chamber || a.doctorId?.clinicAddress || a.doctorId?.city || "";
                  const dateStr = a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Scheduled Date";
                  const timeStr = a.timeSlot?.startTime ? `${a.timeSlot.startTime}${a.timeSlot.endTime ? ` - ${a.timeSlot.endTime}` : ""}` : "";
                  const fee = a.fee || a.doctorId?.consultationFee || 800;

                  return (
                    <div
                      key={a._id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all space-y-3"
                    >
                      {/* Doctor Info & Badges Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
                            {docName.replace(/^Dr\.\s*|^(Asst\.|Assoc\.|Prof\.)\s*/gi, "").trim()[0] || "D"}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-extrabold text-sm text-slate-900 truncate" title={docName}>
                                {docName}
                              </h4>
                              <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-teal-100/70 text-teal-800">
                                {docSpecialty}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-700">📅 {dateStr}</span>
                              {timeStr && <span className="text-slate-400 font-mono">🕒 {timeStr}</span>}
                              <span className="capitalize px-1.5 py-0.2 bg-slate-200/60 text-slate-700 rounded text-[10px] font-medium">
                                {a.consultationType === "online" ? "🌐 Online" : "🏥 In-Chamber"}
                              </span>
                            </div>
                            {chamber && (
                              <p className="text-[11px] text-slate-400 truncate max-w-sm" title={chamber}>
                                📍 {chamber}
                              </p>
                            )}
                            {a.reason && (
                              <p className="text-[11px] text-slate-500 italic pt-0.5 line-clamp-1">
                                &quot;{a.reason}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status & Action Badges */}
                        <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 shrink-0 self-start sm:self-auto">
                          <div className="flex items-center gap-1.5">
                            {a.paymentStatus === "paid" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                ✓ Paid (৳{fee})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                Unpaid (৳{fee})
                              </span>
                            )}
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                a.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : a.status === "confirmed"
                                  ? "bg-sky-100 text-sky-800"
                                  : a.status === "cancelled"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {a.status}
                            </span>
                          </div>

                          {(a.status === "confirmed" || a.status === "pending") && (
                            <button
                              onClick={() => handleCancelAppointment(a._id)}
                              disabled={cancellingId === a._id}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer pt-0.5"
                            >
                              {cancellingId === a._id ? "Cancelling..." : "Cancel Booking"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enrolled Courses */}
          <div className="content-card p-5 sm:p-6 rounded-3xl space-y-4">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                <BookOpen size={18} style={{ marginRight: 8 }} />
                My Courses
              </h2>
              <Link to="/courses" className="text-link">
                Browse <ArrowRight size={14} />
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>
                <BookOpen size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p style={{ margin: 0 }}>Not enrolled in any courses</p>
                <Link to="/courses" className="text-link" style={{ marginTop: 8, display: "inline-flex" }}>
                  Explore courses <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {enrollments.slice(0, 5).map((e) => (
                  <Link
                    key={e._id}
                    to={`/courses/${e.courseId?.slug || e.courseId?._id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "var(--bg)",
                      borderRadius: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {e.courseId?.title || "Course"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {e.status} • {e.progress}% complete
                      </div>
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: `conic-gradient(var(--teal) ${e.progress * 3.6}deg, var(--line) 0)`,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "white",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 10,
                          fontWeight: 800,
                          color: "var(--teal)",
                        }}
                      >
                        {e.progress}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Blood & Donor Network Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left: My Blood Requests */}
          <div className="content-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                <Droplet size={18} style={{ marginRight: 8, color: "#d94452" }} />
                My Blood Requests
              </h2>
              <Link to="/blood" className="text-link">
                + New Request <ArrowRight size={14} />
              </Link>
            </div>

            {myRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: 26, color: "var(--muted)" }}>
                <Droplet size={28} style={{ marginBottom: 8, opacity: 0.4, color: "#d94452" }} />
                <p style={{ margin: 0, fontSize: 13 }}>No active blood requests posted</p>
                <Link to="/blood" className="text-link" style={{ marginTop: 8, display: "inline-flex", fontSize: 12 }}>
                  Request blood for a patient <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {myRequests.map((r) => (
                  <div
                    key={r._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "var(--bg)",
                      borderRadius: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "#d94452", background: "#ffebe3", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>
                          {r.bloodGroup}
                        </span>
                        <span>{r.patientName || "Patient"}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>({r.unitsNeeded || 1} unit)</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        {r.hospitalName} • Needed: {r.neededByDate ? new Date(r.neededByDate).toISOString().slice(0, 10) : "Soon"}
                      </div>
                    </div>
                    <span
                      className="pill"
                      style={{
                        background: r.status === "open" ? "#ffebe3" : "#e5f5e9",
                        color: r.status === "open" ? "#d94452" : "#2a7a4e",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: My Registered Donor Profile */}
          <div className="content-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                <HeartHandshake size={18} style={{ marginRight: 8, color: "var(--teal)" }} />
                Volunteer Donor Profile
              </h2>
              <Link to="/blood" className="text-link">
                Blood Portal <ArrowRight size={14} />
              </Link>
            </div>

            {myDonor ? (
              <div style={{ padding: "16px 18px", background: "var(--bg)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ffebe3", color: "#d94452", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 18 }}>
                      {myDonor.bloodGroup}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>Active Registered Donor</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Area: {myDonor.address || "Bangladesh"}</div>
                    </div>
                  </div>
                  <span
                    className="pill"
                    style={{
                      background: myDonor.isAvailable ? "#e5f5e9" : "#fff3cd",
                      color: myDonor.isAvailable ? "#2a7a4e" : "#856404",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {myDonor.isAvailable ? "✓ Eligible & Available" : "Resting"}
                  </span>
                </div>

                <div style={{ fontSize: 12, color: "var(--ink-soft)", borderTop: "1px solid var(--line)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                  <span>Last recorded donation:</span>
                  <span style={{ fontWeight: 700 }}>{myDonor.lastDonationDate ? new Date(myDonor.lastDonationDate).toISOString().slice(0, 10) : "Not recorded yet"}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 26, color: "var(--muted)" }}>
                <HeartHandshake size={28} style={{ marginBottom: 8, opacity: 0.4, color: "var(--teal)" }} />
                <p style={{ margin: 0, fontSize: 13 }}>You are not yet registered as a donor</p>
                <Link to="/blood" className="text-link" style={{ marginTop: 8, display: "inline-flex", fontSize: 12 }}>
                  Register to save lives <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
          {[
            { to: "/doctors", icon: Stethoscope, label: "Find a Doctor", color: "#0f766e" },
            { to: "/blood", icon: Droplet, label: "Blood & Donation", color: "#d94452" },
            { to: "/courses", icon: BookOpen, label: "Courses", color: "#6b5ce7" },
            { to: "/articles", icon: Heart, label: "Health Articles", color: "#e07a2f" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="content-card"
              style={{
                padding: 20,
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "transform .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <link.icon size={20} style={{ color: link.color }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{link.label}</span>
              <ArrowRight size={14} style={{ marginLeft: "auto", color: "var(--muted)" }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
