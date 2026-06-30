import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutGrid, 
  Package, 
  Plus, 
  ShoppingCart, 
  LogOut, 
  Settings, 
  UserCircle,
  Activity
} from "lucide-react";
import "../../styles/VendorSidebar.css";

export default function VendorSidebar() {
  const navigate = useNavigate();

  // Safe parsing of vendor data
  let vendor = null;
  try {
    vendor = JSON.parse(localStorage.getItem("vendorAuth"));
  } catch {
    vendor = null;
  }

  const shopName = vendor?.shopName || "Vendor Dashboard";

  const logout = () => {
  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) return;

  localStorage.removeItem("vendorAuth");
  navigate("/vendor/login");
};

  return (
    <>
      {/* MOBILE TOP IDENTITY BAR (Visible only on < 768px) */}
      <div className="gl-v-mobile-header">
        <div className="gl-v-brand-box-sm">
          <Activity size={16} strokeWidth={2} />
        </div>
        <span className="gl-v-shop-name-sm">{shopName.toUpperCase()}</span>
        <button className="gl-v-mobile-logout" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      {/* MAIN SIDEBAR (Becomes Bottom Nav on < 768px) */}
      <aside className="gl-v-sidebar">
        
        {/* DESKTOP HEADER SECTION */}
        <div className="gl-v-sidebar-header">
          <div className="gl-v-brand-box">
            <Activity size={18} strokeWidth={2} />
          </div>
          <div className="gl-v-shop-info">
            <h2 className="gl-v-shop-name">{shopName.toUpperCase()}</h2>
            <span className="gl-v-tag">PARTNER_PORTAL_26</span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="gl-v-nav">
          <NavLink to="/vendor/dashboard" className={({ isActive }) => isActive ? "gl-v-link active" : "gl-v-link"}>
            <LayoutGrid size={20} strokeWidth={1.5} /> 
            <span>DASHBOARD</span>
          </NavLink>

          <NavLink to="/vendor/products" className={({ isActive }) => isActive ? "gl-v-link active" : "gl-v-link"}>
            <Package size={20} strokeWidth={1.5} /> 
            <span>INVENTORY</span>
          </NavLink>

          <NavLink to="/vendor/add-product" className={({ isActive }) => isActive ? "gl-v-link active" : "gl-v-link"}>
            <Plus size={20} strokeWidth={1.5} /> 
            <span>NEW_ENTRY</span>
          </NavLink>

          <NavLink to="/vendor/orders" className={({ isActive }) => isActive ? "gl-v-link active" : "gl-v-link"}>
            <ShoppingCart size={20} strokeWidth={1.5} /> 
            <span>ORDERS</span>
          </NavLink>

          <div className="gl-v-divider"></div>

          <NavLink to="/vendor/profile" className={({ isActive }) => isActive ? "gl-v-link active" : "gl-v-link"}>
            <UserCircle size={20} strokeWidth={1.5} /> 
            <span>PROFILE</span>
          </NavLink>

          
        </nav>

        {/* DESKTOP FOOTER SECTION */}
        <div className="gl-v-footer">
          <button className="gl-v-logout-btn" onClick={logout}>
            <LogOut size={16} strokeWidth={1.5} /> 
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}