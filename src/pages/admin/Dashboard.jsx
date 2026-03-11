import AdminSidebar from "../../components/admin/AdminSidebar";
import { Users, UserCheck, Clock, ArrowUpRight } from "lucide-react";
import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-container">
      <AdminSidebar active="dashboard" />

      <main className="admin-content">
        <header className="admin-header-box">
          <span className="system-status">// SYSTEM_OPERATIONAL</span>
          <h1 className="welcome">Welcome, Admin 👋</h1>
          <p className="subtitle">
            Archive Oversight: Manage vendors, shops, and marketplace approvals.
          </p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <Users size={20} strokeWidth={1.5} />
              <ArrowUpRight size={14} className="stat-arrow" />
            </div>
            <div className="stat-value">14</div>
            <p className="stat-label">TOTAL VENDORS</p>
          </div>

          <div className="stat-card pending">
            <div className="stat-card-header">
              <Clock size={20} strokeWidth={1.5} />
              <div className="pulse-dot"></div>
            </div>
            <div className="stat-value">05</div>
            <p className="stat-label">PENDING APPROVALS</p>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <UserCheck size={20} strokeWidth={1.5} />
            </div>
            <div className="stat-value">09</div>
            <p className="stat-label">APPROVED VENDORS</p>
          </div>
        </div>

        <div className="dashboard-footer-line">
          <span>TAGTURN_CORE_V.2.6</span>
          <span>DATA_REFRESH: {new Date().toLocaleTimeString()}</span>
        </div>
      </main>
    </div>
  );
}
