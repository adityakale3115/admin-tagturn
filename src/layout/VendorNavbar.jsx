import { FiMenu } from "react-icons/fi";
import useAuthListener from "../hooks/useAuthListener";
import "../styles/vendorLayout.css";

export default function VendorNavbar({ toggleSidebar }) {
  const user = useAuthListener();

  return (
    <div className="vendor-navbar">
      <FiMenu size={24} className="menu-icon" onClick={toggleSidebar} />

      <h3>TAGTURN Vendor Dashboard</h3>

      {user?.photoURL ? (
        <img src={user.photoURL} alt="profile" className="nav-profile" />
      ) : (
        <div className="nav-profile default"></div>
      )}
    </div>
  );
}
