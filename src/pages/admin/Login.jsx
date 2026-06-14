import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Shield, LogIn } from "lucide-react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import "../../styles/Auth.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  // 🛡️ Whitelisted Admin Email
  const ADMIN_EMAIL = "prathameshpvadde2004@gmail.com";

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1️⃣ Check if the logged-in email matches your admin email
      if (user.email === ADMIN_EMAIL) {
        toast.success("Admin access granted");
        
        // 2️⃣ Set your local flag for the ProtectedRoutes
        localStorage.setItem("adminAuth", "true");
        
        navigate("/admin/dashboard");
      } else {
        // 3️⃣ If not the admin, sign them out immediately
        await auth.signOut();
        toast.error("Access denied: Unauthorized account");
      }
    } catch (error) {
      console.error(error);
      if (error.code !== "auth/cancelled-popup-request") {
        toast.error("Google Sign-In failed");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-container">
            <Shield size={36} color="white" strokeWidth={1.5} />
          </div>
          <h2>Admin Portal</h2>
          <p className="auth-subtitle">
            Please sign in with the authorized Google account.
          </p>
        </div>

        <div className="auth-form-content">
          <button className="auth-btn google-btn" onClick={loginWithGoogle}>
            <LogIn size={20} /> Continue with Google
          </button>
          
          <p className="auth-footer-note">
            Authorized access only for: <br />
            <strong>{ADMIN_EMAIL}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}