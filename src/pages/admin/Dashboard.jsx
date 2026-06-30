import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Users,
  UserCheck,
  Clock,
  User,
  Package,
  DollarSign,
} from "lucide-react";
import "../../styles/AdminDashboard.css";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function AdminDashboard() {
  const [totalVendors, setTotalVendors] = useState(0);
  const [pendingVendors, setPendingVendors] = useState(0);
  const [approvedVendors, setApprovedVendors] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [devModeActive, setDevModeActive] = useState(false);
  const [togglingDevMode, setTogglingDevMode] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ===== TOTAL VENDORS =====
        const vendorsSnap = await getDocs(
          collection(db, "vendors")
        );
        setTotalVendors(vendorsSnap.size);

        // ===== PENDING VENDORS =====
        const pendingSnap = await getDocs(
          query(
            collection(db, "vendors"),
            where("status", "==", "pending")
          )
        );
        setPendingVendors(pendingSnap.size);

        // ===== APPROVED VENDORS =====
        const approvedSnap = await getDocs(
          query(
            collection(db, "vendors"),
            where("status", "==", "approved")
          )
        );
        setApprovedVendors(approvedSnap.size);

        // ===== TOTAL USERS =====
        try {
          const usersSnap = await getDocs(
            collection(db, "users")
          );
          setTotalUsers(usersSnap.size);
        } catch (err) {
          console.log("Users permission denied");
        }

        // ===== TOTAL LISTINGS =====
        const productsSnap = await getDocs(
          collection(db, "products")
        );
        setTotalListings(productsSnap.size);

        // ===== TOTAL REVENUE =====
        const ordersSnap = await getDocs(
          collection(db, "vendorOrders")
        );

        let revenue = 0;

        ordersSnap.forEach((d) => {
          const data = d.data();

          if (data.status !== "cancelled") {
            revenue += Number(data.totalAmount || 0);
          }
        });

        setTotalRevenue(revenue);

        // ===== CURRENT DEV MODE STATE =====
        const settingsSnap = await getDoc(doc(db, "settings", "siteConfig"));
        if (settingsSnap.exists()) {
          setDevModeActive(!!settingsSnap.data().showDevPage);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleToggleDevMode = async () => {
    setTogglingDevMode(true);
    const next = !devModeActive;
    try {
      await setDoc(
        doc(db, "settings", "siteConfig"),
        { showDevPage: next, updatedAt: new Date() },
        { merge: true }
      );
      setDevModeActive(next);
    } catch (err) {
      console.error("Failed to toggle dev mode:", err);
      alert("Failed to update site status.");
    } finally {
      setTogglingDevMode(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar active="dashboard" />

      <main className="admin-content">
        <header className="admin-header-box">
          <span className="system-status">
            // SYSTEM_OPERATIONAL
          </span>

          <h1 className="welcome">
            Welcome, Admin 👋
          </h1>

          <p className="subtitle">
            Archive Oversight: Manage vendors,
            shops, and marketplace approvals.
          </p>
        </header>

        <div className="stats-grid">
          {/* Total Vendors */}
          <div className="stat-card">
            <div className="stat-card-header">
              <Users size={20} strokeWidth={1.5} />
             
            </div>

            <div className="stat-value">
              {loading ? "..." : totalVendors}
            </div>

            <p className="stat-label">
              TOTAL VENDORS
            </p>
          </div>

          {/* Pending Approvals */}
          <div className="stat-card pending">
            <div className="stat-card-header">
              <Clock size={20} strokeWidth={1.5} />
              <div className="pulse-dot"></div>
            </div>

            <div className="stat-value">
              {loading ? "..." : pendingVendors}
            </div>

            <p className="stat-label">
              PENDING APPROVALS
            </p>
          </div>

          {/* Approved Vendors */}
          <div className="stat-card">
            <div className="stat-card-header">
              <UserCheck
                size={20}
                strokeWidth={1.5}
              />
              
            </div>

            <div className="stat-value">
              {loading ? "..." : approvedVendors}
            </div>

            <p className="stat-label">
              APPROVED VENDORS
            </p>
          </div>

          {/* Total Users */}
          <div className="stat-card">
            <div className="stat-card-header">
              <User size={20} strokeWidth={1.5} />
             
            </div>

            <div className="stat-value">
              {loading ? "..." : totalUsers}
            </div>

            <p className="stat-label">
              TOTAL USERS
            </p>
          </div>

          {/* Total Listings */}
          <div className="stat-card">
            <div className="stat-card-header">
              <Package
                size={20}
                strokeWidth={1.5}
              />
             
            </div>

            <div className="stat-value">
              {loading ? "..." : totalListings}
            </div>

            <p className="stat-label">
              TOTAL LISTINGS
            </p>
          </div>

          {/* Total Revenue */}
          <div className="stat-card">
            <div className="stat-card-header">
              <DollarSign
                size={20}
                strokeWidth={1.5}
              />
             
            </div>

            <div className="stat-value">
              {loading
                ? "..."
                : `₹${totalRevenue.toLocaleString()}`}
            </div>

            <p className="stat-label">
              TOTAL REVENUE
            </p>
          </div>
        </div>

        {/* ── Dev Mode Toggle ── */}
        <div className="dev-mode-card">
          <div>
            <p className="dev-mode-title">Site Maintenance / Dev Page</p>
            <p className="dev-mode-desc">
              {devModeActive
                ? "The public site is currently showing the Contact Developer page."
                : "The public site is currently live and operational."}
            </p>
          </div>
          <button
            className={`dev-mode-btn ${devModeActive ? "dev-mode-btn-active" : ""}`}
            onClick={handleToggleDevMode}
            disabled={togglingDevMode}
          >
            {togglingDevMode
              ? "Updating…"
              : devModeActive
              ? "Turn Off Dev Page"
              : "Show Dev Page"}
          </button>
        </div>

        <div className="dashboard-footer-line">
          <span>TAGTURN_CORE_V.2.6</span>

          <span>
            DATA_REFRESH:{" "}
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </main>
    </div>
  );
}