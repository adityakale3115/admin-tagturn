import { useState } from "react";
import { loginVendor } from "../../services/vendorService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Store, Loader2 } from "lucide-react"; 
import "../../styles/Auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ... rest of the component ... */

const submit = async () => {
  if (!form.email || !form.password) {
    return toast.warn("Please enter both email and password");
  }

  setLoading(true);
  try {
    const user = await loginVendor(form.email, form.password);
    
    toast.success("Welcome back! Login Successful 🎉");
    localStorage.setItem("vendorAuth", user.uid);

    setTimeout(() => {
      navigate("/vendor/dashboard");
    }, 800);
  } catch (err) {
    // Clear any accidental local storage on failure
    localStorage.removeItem("vendorAuth");

    // Mapping error codes to user-friendly messages
    const errorMessages = {
      PENDING_APPROVAL: "⏳ Your account is awaiting admin approval.",
      REJECTED: "🚫 Your request was rejected by the admin.",
      USER_NOT_FOUND: "❌ Vendor record not found. Please register.",
      "auth/invalid-credential": "❌ Incorrect Email or Password",
      "auth/user-not-found": "❌ Account not found.",
      "auth/wrong-password": "❌ Incorrect Password",
    };
    
    // Check if the error code is a standard Firebase auth code or our custom message
    const message = errorMessages[err.code] || errorMessages[err.message] || "❌ Login failed. Please try again.";
    
    toast.error(message);
    console.error("Full Login Error:", err);
  } finally {
    setLoading(false);
  }
};

/* ... rest of the component ... */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-container">
            <Store size={32} />
          </div>
          <h2>Vendor Login</h2>
          <p className="auth-subtitle">
            Enter your credentials to access your store dashboard.
          </p>
        </div>

        <div className="auth-input-wrapper">
          <Mail className="auth-input-icon" size={20} />
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className="auth-input-wrapper">
          <Lock className="auth-input-icon" size={20} />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyPress}
          />
        </div>

        <button 
          className="auth-btn" 
          onClick={submit} 
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20} /> Signing in...</>
          ) : (
            <>
              <LogIn size={20} /> Login
            </>
          )}
        </button>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <span
              className="auth-footer-link"
              onClick={() => navigate("/vendor/signup")}
            >
              Register your store
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}