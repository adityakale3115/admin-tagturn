import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";

// ADMIN
import AdminLogin from "./pages/admin/Login";
import AdminListing from "./pages/admin/AdminListings"
import AdminDashboard from "./pages/admin/Dashboard";
import VendorRequests from "./pages/admin/VendorRequests";
import ManageCategories from "./pages/admin/ManageCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AllOrders from "./pages/admin/AllOrders"

// VENDOR
import VendorLogin from "./pages/vendor/Login";
import VendorSignup from "./pages/vendor/Signup";
import VendorDashboard from "./pages/vendor/Dashboard";
import AddProduct from "./pages/vendor/AddProduct";
import ProductsList from "./pages/vendor/ProductsList";
import VendorProfile from "./pages/vendor/Profile";
import ForgotPassword from "./pages/vendor/ForgotPassword";
import VendorOrders from "./pages/vendor/VendorOrders"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllVendors from "./pages/admin/AllVendors";
import AllEnquiries from "./pages/admin/Allenquiries ";

export default function App() {
  return (
    <BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />

      <Routes>
        {/* ROOT */}
        <Route path="/" element={<RoleSelection />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/vendor-requests" element={<VendorRequests />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/listings" element={<AdminListing />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/allorders" element={<AllOrders />} />
        <Route path="/admin/allvendors" element={<AllVendors />} />
        <Route path="/admin/enquiry" element={<AllEnquiries />} />

        {/* VENDOR */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/signup" element={<VendorSignup />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/add-product" element={<AddProduct />} />
        <Route path="/vendor/products" element={<ProductsList />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path="/vendor/forgot-password" element={<ForgotPassword />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}