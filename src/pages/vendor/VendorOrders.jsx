import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
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

  const markAsDelivered = async (order) => {
  try {
    // Update vendor order
    await updateDoc(
      doc(db, "vendorOrders", order.id),
      {
        status: "delivered",
      }
    );

    // Find matching customer order
    const q = query(
      collection(db, "orders"),
      where("orderId", "==", order.orderId)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      console.warn(
        "No matching order found in orders collection:",
        order.orderId
      );
    }

    for (const orderDoc of snap.docs) {
      await updateDoc(
        doc(db, "orders", orderDoc.id),
        {
          deliveryStatus: "delivered",
        }
      );
    }

    // Update local UI immediately
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, status: "delivered" }
          : o
      )
    );

    alert("Order marked as delivered");
  } catch (err) {
    console.error("Delivery Update Error:", err);
    alert("Failed to update order");
  }
};

const handlePrintInvoice = async (order) => {
  try {
    const vendorSnap = await getDoc(doc(db, "vendors", order.vendorId));

    let vendor = null;

    if (vendorSnap.exists()) {
      vendor = vendorSnap.data();
    }

    console.log("Vendor:", vendor);

    printInvoice(order, vendor);
  } catch (err) {
    console.error(err);
  }
};

  const printInvoice = (order, vendor) => {
  const user = order.userInfo || {};
  const items = order.items || [];
  console.log("Vendor:", vendor);
  const invoiceWindow = window.open("", "_blank");
  invoiceWindow.document.write(`
    <html>
      <head>
        <title>Invoice ${order.orderId}</title>
        <style>
          body {
            font-family: Arial;
            padding: 40px;
            color: #333;
            position: relative;
          }

          /* ── TagTurn Watermark ── */
          body::before {
            content: "TagTurn";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 100px;
            font-weight: 900;
            color: rgba(0, 0, 0, 0.05);
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
            letter-spacing: 10px;
          }

          .content { position: relative; z-index: 1; }

          /* ── Header ── */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #222;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 32px;
            font-weight: 900;
            letter-spacing: 2px;
            color: #111;
          }
          .invoice-label {
            font-size: 22px;
            font-weight: bold;
            color: #555;
          }

          /* ── From / To ── */
          .address-row {
            display: flex;
            gap: 40px;
            margin-bottom: 28px;
          }
          .address-box {
            flex: 1;
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px 20px;
          }
          .address-box h3 {
            margin: 0 0 10px 0;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
          }
          .address-box p {
            margin: 4px 0;
            font-size: 14px;
            line-height: 1.5;
          }
          .address-box .name {
            font-weight: bold;
            font-size: 16px;
            color: #111;
          }

          /* ── Order Meta ── */
          .order-meta {
            display: flex;
            gap: 30px;
            margin-bottom: 24px;
            font-size: 14px;
          }
          .order-meta span { color: #555; }
          .order-meta b   { color: #111; }

          /* ── Items Table ── */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #222;
            color: #fff;
            padding: 10px 12px;
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            border-bottom: 1px solid #eee;
            padding: 10px 12px;
            font-size: 14px;
          }
          tr:last-child td { border-bottom: none; }
          tr:nth-child(even) td { background: #fafafa; }

          /* ── Total ── */
          .total-row {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
          }
          .total-box {
            background: #222;
            color: #fff;
            padding: 14px 30px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 1px;
          }

          /* ── Footer ── */
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #aaa;
            border-top: 1px solid #eee;
            padding-top: 16px;
          }

          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="content">

          <!-- Header -->
          <div class="header">
            <div class="brand">TagTurn</div>
            <div class="invoice-label">INVOICE</div>
          </div>

          <!-- Order Meta -->
          <div class="order-meta">
            <div><span>Order ID: </span><b>${order.orderId}</b></div>
            <div><span>Status: </span><b>${order.status || "-"}</b></div>
            <div><span>Date: </span><b>${
              order.createdAt
                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric"
                  })
                : new Date().toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric"
                  })
            }</b></div>
          </div>

          <!-- From / To Addresses -->
          <div class="address-row">
            <div class="address-box">
              <h3>From (Vendor)</h3>
              <p class="name">${vendor?.shopName || "TagTurn Seller"}</p>
              <p>${vendor?.address || "-"}</p>
              ${vendor?.phone ? `<p>📞 ${vendor.phone}</p>` : ""}
              ${vendor?.email ? `<p>✉️ ${vendor.email}</p>` : ""}
              ${vendor?.gst ? `<p>GST: ${vendor.gst}</p>` : ""}
            </div>
            <div class="address-box">
              <h3>To (Customer)</h3>
              <p class="name">${user.name || "-"}</p>
              <p>${user.address || "-"}</p>
              ${user.mobile ? `<p>📞 ${user.mobile}</p>` : ""}
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.size || "-"}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <!-- Total -->
          <div class="total-row">
            <div class="total-box">Total: ₹${order.totalAmount}</div>
          </div>

          <!-- Footer -->
          <div class="footer">
            Thank you for shopping with <b>TagTurn</b>! &nbsp;|&nbsp; This is a computer-generated invoice.
          </div>

        </div>
      </body>
    </html>
  `);
  invoiceWindow.document.close();
  invoiceWindow.print();
};

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
                      <td>
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    {renderStatusBadge(order.status)}

    <button
      className="invoice-btn"
      onClick={() => handlePrintInvoice(order)}
    >
      Invoice
    </button>

    {order.status !== "delivered" && (
      <button
        className="deliver-btn"
        onClick={() => markAsDelivered(order)}
      >
        Deliver
      </button>
    )}
  </div>
</td>
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
                    <button
  className="invoice-btn"
  onClick={() => handlePrintInvoice(order)}
>
  Print Invoice
</button>
{order.status !== "delivered" && (
  <button
    className="deliver-btn"
    onClick={() => markAsDelivered(order)}
  >
    Mark Delivered
  </button>
)}
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