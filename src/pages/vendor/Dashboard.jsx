import React, { useState, useEffect } from "react";
import VendorLayout from "../../layout/VendorLayout";
import {
  Package,
  DollarSign,
  FileText,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/firebaseConfig";

export default function Dashboard() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState("light");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) return;

        // Fetch total products
        const productQuery = query(
          collection(db, "products"),
          where("shop_id", "==", user.uid)
        );

        const productSnapshot = await getDocs(productQuery);
        setTotalProducts(productSnapshot.size);

        // Fetch vendor orders for revenue
        const orderQuery = query(
          collection(db, "vendorOrders"),
          where("vendorId", "==", user.uid)
        );

        const orderSnapshot = await getDocs(orderQuery);

        let revenue = 0;

        orderSnapshot.forEach((doc) => {
          const data = doc.data();

          // Ignore cancelled orders if desired
          if (data.status !== "cancelled") {
            revenue += Number(data.totalAmount || 0);
          }
        });

        setTotalRevenue(revenue);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const STATS = [
    {
      icon: Package,
      value: totalProducts,
      label: "Total Products",
      trend: "+0%",
      isPos: true,
    },
    {
      icon: DollarSign,
      value: `₹${totalRevenue.toLocaleString()}`,
      label: "Gross Revenue",
      trend: "+0%",
      isPos: true,
    },
  ];

  return (
    <div className={`pl-page theme-${theme}`}>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-info">
            <h1 className="header-title">Vendor Station</h1>
            <p className="header-subtitle">
              System metrics & commercial logs.
            </p>
          </div>
        </header>

        <section className="stats-grid">
          {STATS.map((stat, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-header">
                <div className="stat-icon-wrapper">
                  <stat.icon size={20} />
                </div>

                <span
                  className={`trend-badge ${
                    stat.isPos ? "pos" : "neg"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>

              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </section>

        <div className="dashboard-main-content">
          <section className="actions-section">
            <h2>Quick Actions</h2>

            <div className="actions-grid">
              <button
                className="action-btn"
                onClick={() => navigate("/vendor/profile")}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>

              <button
                className="action-btn"
                onClick={() => navigate("/vendor/products")}
              >
                <FileText size={20} />
                <span>Products</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <VendorLayout />
    </div>
  );
}