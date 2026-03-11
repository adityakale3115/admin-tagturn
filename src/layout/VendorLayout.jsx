import VendorSidebar from "../components/vendor/VendorSidebar";
import "../styles/VendorLayout.css";

export default function VendorLayout({ children }) {
  return (
    <div className="vendor-layout">
      <VendorSidebar />
      <main className="vendor-main">{children}</main>
    </div>
  );
}
