import React, { useState, useEffect } from "react";
import VendorLayout from "../../layout/VendorLayout";
import { Package, DollarSign, FileText, Settings, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/firebaseConfig";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        // Products
        const productSnapshot = await getDocs(
          query(collection(db, "products"), where("shop_id", "==", user.uid))
        );
        setTotalProducts(productSnapshot.size);

        // Orders
        const orderSnapshot = await getDocs(
          query(collection(db, "vendorOrders"), where("vendorId", "==", user.uid))
        );

        let revenue = 0;
        let orders = 0;
        const monthMap = {}; // { "Jan 2025": totalAmount }
        const statusMap = {};

        orderSnapshot.forEach((doc) => {
          const data = doc.data();
          const status = data.status || "unknown";
          const amount = Number(data.totalAmount || 0);

          // Status count
          statusMap[status] = (statusMap[status] || 0) + 1;

          if (status !== "cancelled") {
            revenue += amount;
            orders++;

            // Group by month using createdAt timestamp
            const ts = data.createdAt?.toDate?.() || new Date();
            const key = `${MONTH_LABELS[ts.getMonth()]} ${ts.getFullYear()}`;
            monthMap[key] = (monthMap[key] || 0) + amount;
          }
        });

        setTotalRevenue(revenue);
        setTotalOrders(orders);

        // Build last 6 months array
        const now = new Date();
        const last6 = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          const key = `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
          return { month: MONTH_LABELS[d.getMonth()], revenue: monthMap[key] || 0 };
        });
        setRevenueByMonth(last6);

        // Build status data
        setOrdersByStatus(
          Object.entries(statusMap).map(([status, count]) => ({ status, count }))
        );
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const STATS = [
    { icon: Package, value: totalProducts, label: "Total Products" },
    { icon: DollarSign, value: `₹${totalRevenue.toLocaleString()}`, label: "Gross Revenue" },
    { icon: ShoppingCart, value: totalOrders, label: "Total Orders" },
  ];

  return (
    <div className="pl-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="header-title">Vendor Station</h1>
            <p className="header-subtitle">System metrics & commercial logs.</p>
          </div>
        </header>

        {/* Stat cards */}
        <section className="stats-grid">
          {STATS.map((stat, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-header">
                <div className="stat-icon-wrapper"><stat.icon size={20} /></div>
              </div>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Charts */}
        <div className="dashboard-charts-row">
          <div className="chart-card">
            <h2 className="chart-title">Revenue (last 6 months)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueByMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, "Revenue"]} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#4f46e5" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2 className="chart-title">Orders by status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ordersByStatus} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Orders" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="dashboard-main-content">
          <section className="actions-section">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => navigate("/vendor/profile")}>
                <Settings size={20} /><span>Settings</span>
              </button>
              <button className="action-btn" onClick={() => navigate("/vendor/products")}>
                <FileText size={20} /><span>Products</span>
              </button>
            </div>
          </section>
        </div>
      </div>
      <VendorLayout />
    </div>
  );
}