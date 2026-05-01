import { useState } from "react";
import { forgotPassword } from "../../services/vendorService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import "../../styles/Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email) return toast.warn("Enter your email");

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Reset link sent to your email 📩");

      setTimeout(() => {
        navigate("/vendor/login");
      }, 1500);
    } catch (err) {
      const errorMessages = {
        "auth/user-not-found": "❌ Email not registered",
        "auth/invalid-email": "❌ Invalid email format",
      };

      toast.error(
        errorMessages[err.code] || "❌ Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">
            Enter your registered email to receive reset link.
          </p>
        </div>

        {/* Email */}
        <div className="auth-input-wrapper">
          <Mail className="auth-input-icon" size={20} />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Button */}
        <button className="auth-btn" onClick={handleReset} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        {/* Back */}
        <div className="auth-footer">
          <span
            className="auth-footer-link"
            onClick={() => navigate("/vendor/login")}
          >
            <ArrowLeft size={16} /> Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}