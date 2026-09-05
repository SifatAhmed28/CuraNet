import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Calendar,
  DollarSign,
  Droplet,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building,
} from "lucide-react";
import api from "../../utils/api.js";

export default function AdminDashboardView({ user }) {
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionMessage, setActionMessage] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, apptsRes] = await Promise.all([
        api.admin.stats().catch(() => ({ data: null })),
        api.admin.users().catch(() => ({ data: [] })),
        api.appointments.list().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data || null);
      setUsersList(usersRes.data || []);
      setAppointmentsList(apptsRes.data || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateRole(userId, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setActionMessage(`User role successfully changed to ${newRole}.`);
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      const nextState = !currentActive;
      await api.admin.updateRole(userId, { isActive: nextState });
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: nextState } : u))
      );
      setActionMessage(`User status updated to ${nextState ? "Active" : "Suspended"}.`);
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Admin Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-indigo-900/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-800/60 text-indigo-200 border border-indigo-700/50">
            <ShieldAlert size={14} className="text-indigo-400" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            System Overview &amp; Control Hub
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm max-w-xl">
            Full root privileges: manage accounts, inspect platform consultations, oversee clinical roles, and monitor hospital transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
            <div className="text-xs text-indigo-300 font-bold uppercase">Total Revenue</div>
            <div className="text-xl font-black text-white">
              ৳{(stats?.totalRevenue || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers ?? usersList.length, icon: Users, color: "text-indigo-600 bg-indigo-50" },
          { label: "Total Appointments", value: stats?.totalAppointments ?? appointmentsList.length, icon: Calendar, color: "text-teal-700 bg-teal-50" },
          { label: "Paid Appointments", value: stats?.paidAppointments ?? 0, icon: DollarSign, color: "text-emerald-700 bg-emerald-50" },
          { label: "Blood Donors", value: stats?.totalDonors ?? 0, icon: Droplet, color: "text-rose-600 bg-rose-50" },
        ].map((m) => (
          <div key={m.label} className="content-card p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${m.color}`}>
              <m.icon size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">{m.value}</div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users size={14} />
          <span>User Role &amp; Access Management ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === "appointments"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar size={14} />
          <span>Global Appointments Monitor ({appointmentsList.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="content-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                style={{ paddingLeft: "40px" }}
                className="modern-input text-xs py-2.5 w-full"
                placeholder="Search user by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {["all", "patient", "doctor", "admin", "donor"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition capitalize cursor-pointer ${
                    roleFilter === r
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role Access</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        {u.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4">
                      <select
                        className="p-1.5 rounded-lg border border-slate-200 text-xs font-bold capitalize bg-white cursor-pointer"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                        <option value="donor">Donor</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {u.isActive !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive !== false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          u.isActive !== false
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {u.isActive !== false ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS MONITOR */}
      {activeTab === "appointments" && (
        <div className="content-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">
              Platform-Wide Appointments Monitor
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              {appointmentsList.length} total scheduled visits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Fee / Payment</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointmentsList.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {a.doctorUserId?.name || "Assigned Doctor"}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {a.patientId?.name || "Patient"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {a.appointmentDate ? new Date(a.appointmentDate).toISOString().slice(0, 10) : ""} ({a.timeSlot?.startTime})
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900">৳{a.fee || 700}</span>{" "}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 ${
                          a.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {a.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`pill capitalize text-[10px] font-bold ${
                          a.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : a.status === "confirmed"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
