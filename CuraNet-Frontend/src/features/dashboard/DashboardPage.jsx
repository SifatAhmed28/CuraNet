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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import VerificationModal from "../../components/VerificationModal";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [bloodStats, setBloodStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerify, setShowVerify] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, statsRes] = await Promise.all([
          api.appointments.list().catch(() => ({ data: [] })),
          api.blood.stats().catch(() => ({ data: null })),
        ]);
        setAppointments(apptRes.data || []);
        setBloodStats(statsRes.data);

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

  return (
    <section className="section page-top">
      <div className="container">
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

          <div>
            {user?.isVerified ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl shadow-sm text-xs font-extrabold">
                <ShieldCheck size={18} className="text-emerald-600" />
                Verified CuraNet Identity
              </div>
            ) : (
              <button
                onClick={() => setShowVerify(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 rounded-2xl shadow-sm text-xs font-extrabold transition cursor-pointer"
              >
                <ShieldAlert size={18} className="text-amber-600" />
                Account Unverified — Verify Now
              </button>
            )}
          </div>
        </div>

        <VerificationModal isOpen={showVerify} onClose={() => setShowVerify(false)} />


        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 30 }}>
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
              className="content-card"
              style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${s.color}18`,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Appointments */}
          <div className="content-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                <Stethoscope size={18} style={{ marginRight: 8 }} />
                Appointments
              </h2>
              <Link to="/doctors" className="text-link">
                Book new <ArrowRight size={14} />
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>
                <Calendar size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No appointments yet</p>
                <Link to="/doctors" className="text-link" style={{ marginTop: 8, display: "inline-flex" }}>
                  Find a doctor <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {appointments.slice(0, 5).map((a) => (
                  <div
                    key={a._id}
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
                        {a.doctorUserId?.name || "Doctor"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {a.reason?.slice(0, 40)} • {a.timeSlot?.startTime}
                      </div>
                    </div>
                    <span
                      className="pill"
                      style={{
                        background:
                          a.status === "completed"
                            ? "#e5f5e9"
                            : a.status === "confirmed"
                            ? "#e6f0fb"
                            : a.status === "cancelled"
                            ? "#ffebe3"
                            : "var(--mint)",
                        color:
                          a.status === "completed"
                            ? "#2a7a4e"
                            : a.status === "confirmed"
                            ? "#2b5ea0"
                            : a.status === "cancelled"
                            ? "#a33"
                            : "var(--teal)",
                        fontSize: 11,
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrolled Courses */}
          <div className="content-card" style={{ padding: 22 }}>
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

        {/* Quick Links */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginTop: 24,
          }}
        >
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
