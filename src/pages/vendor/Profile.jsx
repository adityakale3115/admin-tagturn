import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import useAuthListener from "../../hooks/useAuthListener";
import { toast } from "react-toastify";
import "../../styles/Profile.css";
import Sidebar from "../../components/vendor/VendorSidebar";

export default function Profile() {
  const user = useAuthListener();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    shopName: "",
    phone: "",
    address: "",
    gst: "",
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!user?.uid) return;

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for:", user.uid);

        const ref = doc(db, "vendors", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            shopName: data.shopName || "",
            phone: data.phone || "",
            address: data.address || "",
            gst: data.gst || "",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [user]);

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    if (!user?.uid) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);

    try {
      const ref = doc(db, "vendors", user.uid);

      console.log("Saving profile:", profile);

      await setDoc(
        ref,
        {
          ...profile,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("Profile updated successfully ✅");

      // Optional: refetch to reflect latest
      const updatedSnap = await getDoc(ref);
      console.log("Updated data:", updatedSnap.data());

    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <Sidebar />

      <div className="profile-container">
        <h2 className="profile-title">Shop Profile</h2>
        <p className="profile-subtitle">
          Update your store details and contact information
        </p>

        <div className="profile-card">
          <div className="profile-form">

            <div className="form-group">
              <label>Shop Name</label>
              <input
                type="text"
                value={profile.shopName}
                onChange={(e) =>
                  setProfile({ ...profile, shopName: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={profile.gst}
                onChange={(e) =>
                  setProfile({ ...profile, gst: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />
            </div>

            <button
              className="save-btn"
              onClick={saveProfile}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}