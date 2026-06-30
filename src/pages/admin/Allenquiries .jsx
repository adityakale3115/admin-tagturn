import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/AllEnquiries.css";

export default function AllEnquiries() {
  const [enquiries,   setEnquiries]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState("all");

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const snap = await getDocs(collection(db, "enquiry"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setEnquiries(data);
      } catch (err) {
        console.error("Failed to fetch enquiries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  // Distinct enquiry types found in the data (e.g. "newsletter", "contact", etc.)
  const types = Array.from(new Set(enquiries.map((e) => e.type).filter(Boolean)));

  const filtered = enquiries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.email?.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || e.type === typeFilter;
    return matchSearch && matchType;
  });

  const counts = enquiries.reduce((acc, e) => {
    const t = e.type || "other";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const uniqueEmailCount = new Set(enquiries.map((e) => e.email?.toLowerCase()).filter(Boolean)).size;

  const TypeBadge = ({ type }) => {
    const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Other";
    const cls = `eqbadge-${(type || "other").toLowerCase()}`;
    return <span className={`eqbadge ${cls}`}>{label}</span>;
  };

  const handleCopyAll = async () => {
    const emails = filtered.map((e) => e.email).filter(Boolean).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      alert(`Copied ${filtered.length} email(s) to clipboard.`);
    } catch {
      alert("Failed to copy emails.");
    }
  };

  const handleExportCsv = () => {
    const rows = [["Email", "Type", "Date"]];
    filtered.forEach((e) => {
      rows.push([e.email || "", e.type || "", formatDate(e.createdAt)]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-container">
      <AdminSidebar active="enquiries" />

      <main className="admin-content eq-main">

        {/* ── Page Header ── */}
        <header className="eq-header">
          <div>
            <h1 className="eq-title">Enquiries</h1>
            <p className="eq-subtitle">
              View and manage emails collected through newsletter signups and customer enquiries.
            </p>
          </div>
          <div className="eq-header-meta">
            <span className="eq-count-pill">{enquiries.length} Total Enquiries</span>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <div className="eq-stats">
          {[
            { label: "Total Enquiries", val: enquiries.length, color: "#6366f1", bg: "#eef2ff" },
            { label: "Unique Emails",   val: uniqueEmailCount, color: "#16a34a", bg: "#f0fdf4" },
            ...types.map((t) => ({
              label: t.charAt(0).toUpperCase() + t.slice(1),
              val: counts[t] || 0,
              color: "#d97706",
              bg: "#fffbeb",
            })),
          ].map((s) => (
            <div key={s.label} className="eq-stat-card" style={{ "--accent": s.color, "--accent-bg": s.bg }}>
              <div className="eq-stat-num">{loading ? "—" : s.val}</div>
              <div className="eq-stat-label">{s.label}</div>
              <div className="eq-stat-bar" />
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="eq-toolbar">
          <div className="eq-search-wrap">
            <svg className="eq-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="eq-search"
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="eq-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          <div className="eq-toolbar-actions">
            <button className="eq-action-btn" onClick={handleCopyAll} disabled={filtered.length === 0}>
              Copy Emails
            </button>
            <button className="eq-action-btn eq-action-primary" onClick={handleExportCsv} disabled={filtered.length === 0}>
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="eq-empty">Loading enquiries…</div>
        ) : filtered.length === 0 ? (
          <div className="eq-empty">No enquiries found.</div>
        ) : (
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={e.id}>
                    <td className="eq-row-num">{idx + 1}</td>
                    <td className="eq-email-cell">{e.email || "—"}</td>
                    <td><TypeBadge type={e.type} /></td>
                    <td>{formatDate(e.createdAt)}</td>
                    <td className="eq-time">{formatTime(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="eq-footer">
          <span>Showing {filtered.length} of {enquiries.length} enquiries</span>
          <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
        </div>

      </main>
    </div>
  );
}