import { ShieldCheck, Store, ChevronRight, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/RoleSelection.css";

const roles = [
  {
    id: "admin",
    title: "Admin Login",
    subtitle: "System architecture and encrypted user reports",
    icon: <ShieldCheck size={22} strokeWidth={1.5} />,
    path: "/admin/login",
    color: "admin-theme"
  },
  {
    id: "vendor",
    title: "Store Login",
    subtitle: "Fulfillment gateway and shop performance metrics",
    icon: <Store size={22} strokeWidth={1.5} />,
    path: "/vendor/login",
    color: "vendor-theme"
  }
];

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-page-wrapper-light">
      <div className="role-selection-container-light">
        <div className="role-card-gallery">
          
          <div className="role-header-gallery">
            <div className="brand-logo-box-light">
              <LayoutGrid size={32} strokeWidth={1.5} />
            </div>
            {/* Wrapped system text in braces to avoid node errors */}
            <span className="gallery-tag">{"IDENTITY VERIFICATION"}</span>
            <h2 className="role-title-light">Admin Panel Access</h2>
            <p className="role-subtitle-light">
              Authenticate your credentials to enter the TagTurn archive.
            </p>
          </div>

          <div className="role-options-gallery">
            {roles.map((role) => (
              <button 
                key={role.id}
                className={`role-button-gallery ${role.color}`}
                onClick={() => navigate(role.path)}
              >
                <div className="button-content-gallery">
                  <div className="icon-box-gallery">
                    {role.icon}
                  </div>
                  <div className="text-box-gallery">
                    <span className="btn-title-gallery">{role.title}</span>
                    <span className="btn-subtitle-gallery">{role.subtitle}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="chevron-gallery" />
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}