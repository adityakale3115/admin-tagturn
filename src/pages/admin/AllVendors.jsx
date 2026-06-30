import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/AllVendors.css";

export default function AllVendors() {
  const [vendors,      setVendors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId,   setUpdatingId]   = useState(null);
  const [expandedId,   setExpandedId]   = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const snap = await getDocs(collection(db, "vendors"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setVendors(data);
      } catch (err) {
        console.error("Failed to fetch vendors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleStatusChange = async (vendorId, newStatus) => {
    setUpdatingId(vendorId);
    try {
      await updateDoc(doc(db, "vendors", vendorId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v))
      );
    } catch {
      alert("Failed to update vendor status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.shopName?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = vendors.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  const StatusBadge = ({ status }) => {
    const map = {
      approved: { label: "Approved", cls: "vbadge-approved" },
      pending:  { label: "Pending",  cls: "vbadge-pending"  },
      rejected: { label: "Rejected", cls: "vbadge-rejected" },
    };
    const m = map[status] || { label: status || "—", cls: "vbadge-pending" };
    return <span className={`vbadge ${m.cls}`}>{m.label}</span>;
  };

  return (
    <div className="admin-container">
      <AdminSidebar active="vendors" />

      <main className="admin-content vl-main">

        {/* ── Page Header ── */}
        <header className="vl-header">
          <div>
            <h1 className="vl-title">All Sellers</h1>
            <p className="vl-subtitle">
              Manage vendor accounts, review applications, and control store access.
            </p>
          </div>
          <div className="vl-header-meta">
            <span className="vl-count-pill">{vendors.length} Total Sellers</span>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <div className="vl-stats">
          {[
            { label: "Total Sellers",  val: vendors.length,         color: "#6366f1", bg: "#eef2ff" },
            { label: "Approved",       val: counts.approved  || 0,  color: "#16a34a", bg: "#f0fdf4" },
            { label: "Pending",        val: counts.pending   || 0,  color: "#d97706", bg: "#fffbeb" },
            { label: "Rejected",       val: counts.rejected  || 0,  color: "#dc2626", bg: "#fef2f2" },
          ].map((s) => (
            <div key={s.label} className="vl-stat-card" style={{ "--accent": s.color, "--accent-bg": s.bg }}>
              <div className="vl-stat-num">{loading ? "—" : s.val}</div>
              <div className="vl-stat-label">{s.label}</div>
              <div className="vl-stat-bar" />
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="vl-toolbar">
          <div className="vl-search-wrap">
            <svg className="vl-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="vl-search"
              placeholder="Search by shop name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="vl-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="vl-empty">Loading sellers…</div>
        ) : filtered.length === 0 ? (
          <div className="vl-empty">No sellers found.</div>
        ) : (
          <div className="vl-cards">
            {filtered.map((vendor) => {
              const isOpen = expandedId === vendor.id;
              return (
                <div key={vendor.id} className={`vl-card ${isOpen ? "vl-card-open" : ""}`}>

                  {/* Card Top */}
                  <div className="vl-card-top">
                    {/* Avatar / Logo */}
                    <div className="vl-avatar-wrap">
                      {vendor.logoUrl ? (
                        <img src={vendor.logoUrl} alt={vendor.shopName} className="vl-logo" />
                      ) : (
                        <div className="vl-avatar-fallback">
                          {(vendor.shopName || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Shop Info */}
                    <div className="vl-card-info">
                      <div className="vl-shop-name">{vendor.shopName || "Unnamed Shop"}</div>
                      <div className="vl-email">{vendor.email || "—"}</div>
                      <div className="vl-meta-row">
                        {vendor.phone && <span className="vl-chip">📞 {vendor.phone}</span>}
                        {vendor.gst   && <span className="vl-chip">GST: {vendor.gst}</span>}
                        <span className="vl-chip">📅 {formatDate(vendor.createdAt)}</span>
                      </div>
                    </div>

                    {/* Right: badge + actions */}
                    <div className="vl-card-right">
                      <StatusBadge status={vendor.status} />

                      <div className="vl-card-actions">
                        <select
                          className="vl-status-select"
                          value={vendor.status || "pending"}
                          disabled={updatingId === vendor.id}
                          onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                        >
                          <option value="approved">Approve</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Reject</option>
                        </select>

                        <button
                          className="vl-expand-btn"
                          onClick={() => setExpandedId(isOpen ? null : vendor.id)}
                        >
                          {isOpen ? "▲ Less" : "▼ More"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="vl-expand">
                      <div className="vl-expand-grid">

                        <div className="vl-detail-block">
                          <span className="vl-detail-label">Address</span>
                          <span className="vl-detail-val">{vendor.address || "—"}</span>
                        </div>

                        <div className="vl-detail-block">
                          <span className="vl-detail-label">GST Number</span>
                          <span className="vl-detail-val">{vendor.gst || "Not provided"}</span>
                        </div>

                        <div className="vl-detail-block">
                          <span className="vl-detail-label">Phone</span>
                          <span className="vl-detail-val">{vendor.phone || "—"}</span>
                        </div>

                        <div className="vl-detail-block">
                          <span className="vl-detail-label">Joined</span>
                          <span className="vl-detail-val">{formatDate(vendor.createdAt)}</span>
                        </div>

                        <div className="vl-detail-block">
                          <span className="vl-detail-label">Last Updated</span>
                          <span className="vl-detail-val">{formatDate(vendor.updatedAt)}</span>
                        </div>

                        <div className="vl-detail-block">
                          <span className="vl-detail-label">Vendor ID</span>
                          <span className="vl-detail-val vl-mono">{vendor.id}</span>
                        </div>

                      </div>

                      {/* Banner */}
                      {vendor.bannerUrl && (
                        <div className="vl-banner-wrap">
                          <span className="vl-detail-label">Shop Banner</span>
                          <img src={vendor.bannerUrl} alt="banner" className="vl-banner" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="vl-footer">
          <span>Showing {filtered.length} of {vendors.length} sellers</span>
          <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
        </div>

      </main>
    </div>
  );
}