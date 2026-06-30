import { useState } from "react";
import { loginVendor } from "../../services/vendorService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  LogIn,
  Store,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import "../../styles/Auth.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const submit = async () => {
  if (!form.email || !form.password) {
    toast.warning(
      "Please enter both email and password"
    );
    return;
  }

  setLoading(true);

  try {
    const user = await loginVendor(
      form.email,
      form.password
    );

    localStorage.setItem(
      "vendorAuth",
      user.uid
    );

    toast.success(
      "🎉 Login Successful! Welcome back."
    );

    setTimeout(() => {
      navigate("/vendor/dashboard");
    }, 1000);
  } catch (err) {
    localStorage.removeItem("vendorAuth");

    if (
      err.code ===
        "auth/invalid-credential" ||
      err.code === "auth/wrong-password"
    ) {
      toast.error("❌ Wrong Password");
    } else if (
      err.code === "auth/user-not-found"
    ) {
      toast.error("❌ Account not found");
    } else if (
      err.message === "PENDING_APPROVAL"
    ) {
      toast.warning(
        "⏳ Your account is awaiting admin approval."
      );
    } else if (
      err.message === "REJECTED"
    ) {
      toast.error(
        "🚫 Your account was rejected by admin."
      );
    } else {
      toast.error(
        "❌ Login failed. Please try again."
      );
    }

    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") submit();
  };

  return (

    
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-container">
            <Store size={32} />
          </div>
          <h2>Vendor Login</h2>
          <p className="auth-subtitle">
            Enter your credentials to access your store dashboard.
          </p>
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="auth-input-wrapper">
          <Lock className="auth-input-icon" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            onKeyDown={handleKeyPress}
          />

          {/* Eye Toggle */}
          <span
            className="auth-show-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {/* Forgot Password */}
        <div className="auth-forgot">
          <span onClick={() => navigate("/vendor/forgot-password")}>
            Forgot Password?
          </span>
        </div>

        {/* Login Button */}
        <button className="auth-btn" onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Signing in...
            </>
          ) : (
            <>
              <LogIn size={20} /> Login
            </>
          )}
        </button>

        {/* Footer */}
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