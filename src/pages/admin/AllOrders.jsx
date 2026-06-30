import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Package, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/AllOrders.css";

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_META = {
  new:       { label: "NEW",       cls: "badge-new"       },
  confirmed: { label: "CONFIRMED", cls: "badge-confirmed" },
  shipped:   { label: "SHIPPED",   cls: "badge-shipped"   },
  delivered: { label: "DELIVERED", cls: "badge-delivered" },
  cancelled: { label: "CANCELLED", cls: "badge-cancelled" },
};

const Badge = ({ status }) => {
  const m = STATUS_META[status] || { label: status?.toUpperCase() || "—", cls: "badge-new" };
  return <span className={`order-badge ${m.cls}`}>{m.label}</span>;
};

// ── Invoice printer ───────────────────────────────────────────────────────────
const printInvoice = (order, vendor) => {
  const user  = order.userInfo || {};
  const items = order.items    || [];
  const formatTs = (ts) => {
    if (!ts) return "—";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>Invoice ${order.orderId}</title><style>
      body{font-family:Arial;padding:40px;color:#333;position:relative}
      body::before{content:"TagTurn";position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%) rotate(-35deg);font-size:100px;
        font-weight:900;color:rgba(0,0,0,0.05);pointer-events:none;z-index:0;
        white-space:nowrap;letter-spacing:10px}
      .content{position:relative;z-index:1}
      .header{display:flex;justify-content:space-between;align-items:center;
        border-bottom:3px solid #111;padding-bottom:16px;margin-bottom:24px}
      .brand{font-size:30px;font-weight:900;letter-spacing:3px;color:#111}
      .invoice-label{font-size:20px;font-weight:bold;color:#666}
      .address-row{display:flex;gap:30px;margin-bottom:28px}
      .address-box{flex:1;background:#f9f9f9;border:1px solid #e0e0e0;
        border-radius:8px;padding:16px 20px}
      .address-box h3{margin:0 0 10px 0;font-size:11px;text-transform:uppercase;
        letter-spacing:1px;color:#888}
      .address-box p{margin:4px 0;font-size:14px;line-height:1.5}
      .address-box .name{font-weight:bold;font-size:15px;color:#111}
      .meta{display:flex;gap:30px;margin-bottom:24px;font-size:14px}
      .meta span{color:#666} .meta b{color:#111}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      th{background:#111;color:#fff;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase}
      td{border-bottom:1px solid #eee;padding:10px 12px;font-size:14px}
      tr:nth-child(even) td{background:#fafafa}
      .total-row{display:flex;justify-content:flex-end;margin-top:10px}
      .total-box{background:#111;color:#fff;padding:14px 30px;border-radius:8px;font-size:18px;font-weight:bold}
      .footer{margin-top:40px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;padding-top:16px}
    </style></head><body><div class="content">
      <div class="header">
        <div class="brand">TAGTURN</div>
        <div class="invoice-label">INVOICE</div>
      </div>
      <div class="meta">
        <div><span>Order ID: </span><b>${order.orderId}</b></div>
        <div><span>Status: </span><b>${order.status?.toUpperCase() || "—"}</b></div>
        <div><span>Date: </span><b>${formatTs(order.createdAt)}</b></div>
      </div>
      <div class="address-row">
        <div class="address-box">
          <h3>From — Vendor</h3>
          <p class="name">${vendor?.shopName || "TagTurn Seller"}</p>
          <p>${vendor?.address || "—"}</p>
          ${vendor?.phone ? `<p>📞 ${vendor.phone}</p>` : ""}
          ${vendor?.email ? `<p>✉️ ${vendor.email}</p>` : ""}
          ${vendor?.gst   ? `<p>GST: ${vendor.gst}</p>` : ""}
        </div>
        <div class="address-box">
          <h3>To — Customer</h3>
          <p class="name">${user.name    || "—"}</p>
          <p>${user.address || "—"}</p>
          ${user.mobile ? `<p>📞 ${user.mobile}</p>` : ""}
        </div>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Product</th><th>Size</th>
          <th>Qty</th><th>Unit Price</th><th>Subtotal</th>
        </tr></thead>
        <tbody>
          ${items.map((item, i) => `
            <tr>
              <td>${i + 1}</td><td>${item.name}</td><td>${item.size || "—"}</td>
              <td>${item.quantity}</td><td>₹${item.price}</td>
              <td>₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
      <div class="total-row">
        <div class="total-box">Total: ₹${order.totalAmount}</div>
      </div>
      <div class="footer">
        Thank you for shopping with <b>TagTurn</b> &nbsp;|&nbsp; Computer-generated invoice.
      </div>
    </div></body></html>`);
  win.document.close();
  win.print();
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AllOrders() {
  const [orders,       setOrders]       = useState([]);
  const [vendors,      setVendors]      = useState({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId,   setExpandedId]   = useState(null);
  const [updatingId,   setUpdatingId]   = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const snap = await getDocs(collection(db, "vendorOrders"));
        const raw  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const vendorIds = [...new Set(
          raw.map((o) => o.vendorId || o.items?.[0]?.vendorId).filter(Boolean)
        )];

        const vendorMap = {};
        await Promise.all(vendorIds.map(async (vid) => {
          try {
            const vSnap = await getDoc(doc(db, "vendors", vid));
            if (vSnap.exists()) vendorMap[vid] = vSnap.data();
          } catch (_) {}
        }));

        raw.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(raw);
        setVendors(vendorMap);
      } catch (err) {
        console.error("AllOrders fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "vendorOrders", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.orderId?.toLowerCase().includes(q) ||
      o.userInfo?.name?.toLowerCase().includes(q) ||
      o.userInfo?.mobile?.includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = orders.reduce((acc, o) => {
    acc.total = (acc.total || 0) + 1;
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  return (
    <div className="admin-container">
      <AdminSidebar active="orders" />

      <main className="admin-content">
        {/* ── Header ── */}
        <header className="admin-header-box">
          <span className="system-status">// ORDERS_MODULE</span>
          <h1 className="welcome">All Orders 📦</h1>
          <p className="subtitle">
            View, manage, and update every order placed across all vendors.
          </p>
        </header>

        {/* ── Stat Cards ── */}
        <div className="stats-grid">
          {[
            { label: "TOTAL ORDERS",   val: loading ? "..." : counts.total     || 0, cls: ""         },
            { label: "NEW",            val: loading ? "..." : counts.new        || 0, cls: "pending"  },
            { label: "CONFIRMED",      val: loading ? "..." : counts.confirmed  || 0, cls: ""         },
            { label: "SHIPPED",        val: loading ? "..." : counts.shipped    || 0, cls: ""         },
            { label: "DELIVERED",      val: loading ? "..." : counts.delivered  || 0, cls: ""         },
            { label: "TOTAL REVENUE",  val: loading ? "..." : `₹${totalRevenue.toLocaleString()}`, cls: "" },
          ].map((s) => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <div className="stat-card-header">
                <Package size={20} strokeWidth={1.5} />
                {s.cls === "pending" && <div className="pulse-dot" />}
              </div>
              <div className="stat-value">{s.val}</div>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="orders-toolbar">
          <input
            className="orders-search"
            placeholder="// SEARCH_BY: order_id / customer / mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="orders-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">ALL_STATUS</option>
            <option value="new">NEW</option>
            <option value="confirmed">CONFIRMED</option>
            <option value="shipped">SHIPPED</option>
            <option value="delivered">DELIVERED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="orders-empty">
            <span className="system-status">// FETCHING_DATA...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="orders-empty">
            <span className="system-status">// NO_RECORDS_FOUND</span>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  {["#", "ORDER_ID", "CUSTOMER", "MOBILE", "VENDOR", "AMOUNT", "DATE", "STATUS", "ACTIONS"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => {
                  const vid    = order.vendorId || order.items?.[0]?.vendorId;
                  const vendor = vendors[vid]   || {};
                  const isOpen = expandedId === order.id;

                  return (
                    <>
                      <tr key={order.id} className={isOpen ? "row-expanded" : ""}>
                        <td className="td-muted">{idx + 1}</td>
                        <td>
                          <span className="order-id-mono">{order.orderId}</span>
                        </td>
                        <td>{order.userInfo?.name || "—"}</td>
                        <td className="td-muted">{order.userInfo?.mobile || "—"}</td>
                        <td>{vendor.shopName || <span className="td-muted">—</span>}</td>
                        <td><span className="order-amount">₹{order.totalAmount}</span></td>
                        <td className="td-muted">{formatDate(order.createdAt)}</td>
                        <td><Badge status={order.status} /></td>
                        <td>
                          <div className="actions-cell">
                            {/* <select
                              className="status-select"
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              <option value="new">NEW</option>
                              <option value="confirmed">CONFIRMED</option>
                              <option value="shipped">SHIPPED</option>
                              <option value="delivered">DELIVERED</option>
                              <option value="cancelled">CANCELLED</option>
                            </select> */}

                            <button
                              className="btn-expand"
                              onClick={() => setExpandedId(isOpen ? null : order.id)}
                              title="View items"
                            >
                              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              ITEMS
                            </button>

                            <button
                              className="btn-print"
                              onClick={() => printInvoice(order, vendor)}
                              title="Print invoice"
                            >
                              <Printer size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr key={`${order.id}-exp`} className="expand-row">
                          <td colSpan={9}>
                            <div className="expand-panel">
                              <p className="expand-title">// ORDER_ITEMS</p>
                              <div className="expand-items">
                                {(order.items || []).map((item, i) => (
                                  <div key={i} className="expand-item">
                                    {item.image && (
                                      <img src={item.image} alt={item.name} className="item-img" />
                                    )}
                                    <div className="item-info">
                                      <span className="item-name">{item.name}</span>
                                      <span className="item-meta">
                                        SIZE: {item.size || "—"} &nbsp;|&nbsp; QTY: {item.quantity}
                                      </span>
                                    </div>
                                    <span className="item-price">
                                      ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="expand-addresses">
                                <div className="expand-addr-block">
                                  <span className="expand-addr-label">// SHIP_TO</span>
                                  <span>{order.userInfo?.name}</span>
                                  <span>{order.userInfo?.address || "—"}</span>
                                  <span>{order.userInfo?.mobile}</span>
                                </div>
                                {vendor.shopName && (
                                  <div className="expand-addr-block">
                                    <span className="expand-addr-label">// VENDOR</span>
                                    <span>{vendor.shopName}</span>
                                    <span>{vendor.address || "—"}</span>
                                    <span>{vendor.phone || vendor.email || ""}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="dashboard-footer-line">
          <span>TAGTURN_ORDERS_MODULE</span>
          <span>RECORDS: {filtered.length} / {orders.length}</span>
          <span>REFRESH: {new Date().toLocaleTimeString()}</span>
        </div>
      </main>
    </div>
  );
}