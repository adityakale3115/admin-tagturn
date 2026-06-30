import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
  Users,
  Store,
  LogOut,
  UserCheck,
  ClipboardList,
  FolderPlus,
  LayoutGrid,
} from "lucide-react";
import "../../styles/AdminSidebar.css";

export default function AdminSidebar({ active }) {
  const navigate = useNavigate();
  const auth = getAuth();

  const logout = () => {
  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) return;

  localStorage.removeItem("vendorAuth");
  navigate("/admin/login");
};

  return (
    <aside className="gl-sidebar">
      <div className="gl-sidebar-top">
        <div className="gl-sidebar-header">
          <div className="gl-logo-box">
            <LayoutGrid size={20} strokeWidth={2} />
          </div>
          <div className="gl-brand-info">
            <h2 className="gl-admin-title">TAGTURN</h2>
            <span className="gl-version-tag">V.2.6_CORE</span>
          </div>
        </div>

        <nav className="gl-sidebar-nav">
          <div
            className={`gl-nav-item ${active === "dashboard" ? "active" : ""}`}
            onClick={() => navigate("/admin/dashboard")}
          >
            <ClipboardList size={18} strokeWidth={1.5} />
            <span className="gl-nav-label">DASHBOARD</span>
          </div>

          <div
            className={`gl-nav-item ${active === "vendors" ? "active" : ""}`}
            onClick={() => navigate("/admin/vendor-requests")}
          >
            <Users size={18} strokeWidth={1.5} />
            <span className="gl-nav-label">VENDOR_REQUESTS</span>
          </div>

    

          <div className="gl-nav-item">
            <UserCheck size={18} strokeWidth={1.5} />
            <span className="gl-nav-label">VERIFIED_LIST</span>
          </div>

          <div
            className={`gl-nav-item ${active === "categories" ? "active" : ""}`}
            onClick={() => navigate("/admin/categories")}
          >
            <FolderPlus size={18} strokeWidth={1.5} />
            <span className="gl-nav-label">CATEGORIES</span>
          </div>

          <div
            className={`gl-nav-item`}
            onClick={() => navigate("/admin/listings")}
          >
            <Store size={18} strokeWidth={1.5} />
            <span className="gl-nav-label">Admin Listing</span>
          </div>

          <div
            className={`gl-nav-item`}
            onClick={() => navigate("/admin/users")}
          >
            <FolderPlus size={18} strokeWidth={1.5} />
            <span className="gl-nav-label">All Users</span>
          </div>
        </nav>
      </div>

      <div className="gl-sidebar-footer">
        <button className="gl-logout-btn" onClick={logout}>
          <LogOut size={16} strokeWidth={1.5} />
          <span>TERMINATE_SESSION</span>
        </button>
      </div>
    </aside>
  );
}
