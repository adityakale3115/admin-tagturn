import { useState } from "react";
import { registerVendor } from "../../services/vendorService";
import { toast } from "react-toastify";
import { Store, Mail, Lock, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/Auth.css";

export default function Signup() {
  const [form, setForm] = useState({ shopName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const submit = async () => {
    if (!form.shopName || !form.email || !form.password)
      return toast.warning("All fields are required");

    setLoading(true);
    try {
      // This service should save the vendor with status: "pending"
      await registerVendor(form.email, form.password, form.shopName);
      
      toast.success("Request Submitted. Admin Will Approve.");
      
      // Redirect to login page after submit
      setTimeout(() => {
        navigate("/vendor/login"); 
      }, 2000);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-container">
            <Store size={36} color="white" />
          </div>
          <h2>Register Store</h2>
          <p className="auth-subtitle">Create your vendor account and start selling</p>
        </div>

        <div>
          <div className="auth-input-wrapper">
            <input
              placeholder="Shop Name"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            />
            <div className="auth-input-icon"><Store size={20} /></div>
          </div>

          <div className="auth-input-wrapper">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="auth-input-icon"><Mail size={20} /></div>
          </div>

          <div className="auth-input-wrapper">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="auth-input-icon"><Lock size={20} /></div>
          </div>

          <button className="auth-btn" onClick={submit} disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <><CheckCircle size={20} /> Request Approval</>
            )}
          </button>
        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <span
            className="auth-footer-link"
            onClick={() => navigate("/vendor/login")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}