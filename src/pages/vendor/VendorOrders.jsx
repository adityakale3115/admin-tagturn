import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import VendorLayout from "../../layout/VendorLayout";
import "../../../src/styles/VO.css";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "vendorOrders"),
            where("vendorId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const snap = await getDocs(q);
          setOrders(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error("Fetch Error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getStatusClass = (status) =>
    ["new", "pending", "shipped", "delivered", "cancelled"].includes(status)
      ? status
      : "new";

  const renderStatusBadge = (status) => (
    <span className={`status ${getStatusClass(status)}`}>
      <span className="status-dot" />
      {status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "New"}
    </span>
  );

  return (
      <div className="vo-wrapper">
        {/* ── Header ── */}
        <header className="vo-header">
          <h1 className="vo-title">Orders</h1>
          {!loading && (
            <span className="vo-badge">{orders.length} Total</span>
          )}
        </header>

        {/* ── Desktop Table ── */}
        <div className="vo-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Location &amp; Contact</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="vo-state-row">
                  <td colSpan="5">Loading orders…</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr className="vo-state-row">
                  <td colSpan="5">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const firstItem = order.items?.[0] || {};
                  const user = order.userInfo || {};

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="order-id">{order.orderId}</span>
                      </td>
                      <td>
                        <div className="product-cell">
                          <img
                            src={firstItem.image}
                            alt={firstItem.name || "Product"}
                            className="product-img"
                          />
                          <div>
                            <span className="product-name">
                              {firstItem.name}
                            </span>
                            <span className="product-meta">
                              Size: {firstItem.size} · Qty: {firstItem.quantity}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="location-address">
                          {user.address || "No address provided"}
                        </div>
                        <div className="location-meta">
                          📞 {user.mobile || "No mobile"}
                        </div>
                        <div className="location-meta">
                          👤 {user.name || "Unknown Customer"}
                        </div>
                      </td>
                      <td>
                        <span className="amount">₹{order.totalAmount}</span>
                      </td>
                      <td>{renderStatusBadge(order.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="vo-cards">
          {loading ? (
            <div className="vo-card" style={{ textAlign: "center", color: "#888780" }}>
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="vo-card" style={{ textAlign: "center", color: "#888780" }}>
              No orders found.
            </div>
          ) : (
            orders.map((order) => {
              const firstItem = order.items?.[0] || {};
              const user = order.userInfo || {};

              return (
                <div className="vo-card" key={order.id}>
                  {/* Product row */}
                  <div className="vo-card-top">
                    <div className="vo-card-product">
                      <img
                        src={firstItem.image}
                        alt={firstItem.name || "Product"}
                        className="product-img"
                      />
                      <div className="vo-card-product-info">
                        <span className="product-name">{firstItem.name}</span>
                        <span className="product-meta">
                          Size: {firstItem.size} · Qty: {firstItem.quantity}
                        </span>
                      </div>
                    </div>
                    {renderStatusBadge(order.status)}
                  </div>

                  <hr className="vo-card-divider" />

                  {/* Detail grid */}
                  <div className="vo-card-details">
                    <div className="vo-card-detail-item">
                      <span className="vo-card-detail-label">Order ID</span>
                      <span className="order-id" style={{ alignSelf: "flex-start" }}>
                        {order.orderId}
                      </span>
                    </div>
                    <div className="vo-card-detail-item">
                      <span className="vo-card-detail-label">Amount</span>
                      <span className="vo-card-detail-value mono">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                    <div className="vo-card-detail-item">
                      <span className="vo-card-detail-label">Customer</span>
                      <span className="vo-card-detail-value">
                        {user.name || "Unknown"}
                      </span>
                    </div>
                    <div className="vo-card-detail-item">
                      <span className="vo-card-detail-label">Mobile</span>
                      <span className="vo-card-detail-value">
                        {user.mobile || "—"}
                      </span>
                    </div>
                    <div className="vo-card-detail-item" style={{ gridColumn: "1 / -1" }}>
                      <span className="vo-card-detail-label">Address</span>
                      <span className="vo-card-detail-value">
                        {user.address || "No address provided"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
    <VendorLayout />
      </div>
    
  );
}