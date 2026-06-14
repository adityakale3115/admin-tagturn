import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
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
    email: "",
    address: "",
    gst: "",
    logoUrl: "",
    bannerUrl: "",
  });

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  /* ===== FETCH ===== */
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "vendors", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            shopName:  d.shopName  || "",
            phone:     d.phone     || "",
            email:     d.email     || user.email || "",
            address:   d.address   || "",
            gst:       d.gst       || "",
            logoUrl:   d.logoUrl   || "",
            bannerUrl: d.bannerUrl || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, [user]);

  /* ===== IMAGE UPLOAD ===== */
  const uploadImage = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, logoUrl: localUrl, _logoFile: file }));
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, bannerUrl: localUrl, _bannerFile: file }));
  };

  /* ===== SAVE ===== */
  const saveProfile = async () => {
    if (!user?.uid) return toast.error("User not logged in");
    setLoading(true);
    try {
      let logoUrl   = profile.logoUrl;
      let bannerUrl = profile.bannerUrl;

      if (profile._logoFile) {
        logoUrl = await uploadImage(
          profile._logoFile,
          `vendors/${user.uid}/logo`
        );
      }
      if (profile._bannerFile) {
        bannerUrl = await uploadImage(
          profile._bannerFile,
          `vendors/${user.uid}/banner`
        );
      }

      await setDoc(
        doc(db, "vendors", user.uid),
        {
          shopName:  profile.shopName,
          phone:     profile.phone,
          email:     profile.email,
          address:   profile.address,
          gst:       profile.gst,
          logoUrl,
          bannerUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setProfile((p) => ({
        ...p,
        logoUrl,
        bannerUrl,
        _logoFile: null,
        _bannerFile: null,
      }));

      toast.success("Profile updated ✅");
    } catch (err) {
      console.error(err);
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

          {/* ---- Banner ---- */}
          <div
            className="profile-banner"
            onClick={() => bannerInputRef.current.click()}
            style={profile.bannerUrl
              ? { backgroundImage: `url(${profile.bannerUrl})` }
              : {}}
          >
            {!profile.bannerUrl && (
              <span className="upload-hint">
                📷 Click to upload store banner (recommended 1200×300)
              </span>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleBannerChange}
            />
          </div>

          {/* ---- Logo ---- */}
          <div className="profile-logo-row">
            <div
              className="profile-logo"
              onClick={() => logoInputRef.current.click()}
            >
              {profile.logoUrl
                ? <img src={profile.logoUrl} alt="Store logo" />
                : <span className="logo-placeholder">🏪</span>}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
            </div>
            <span className="logo-label">Click logo to change</span>
          </div>

          {/* ---- Form ---- */}
          <div className="profile-form">
            <div className="form-group">
              <label>Shop Name</label>
              <input
                type="text"
                value={profile.shopName}
                onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={profile.gst}
                onChange={(e) => setProfile({ ...profile, gst: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>

            <button className="save-btn" onClick={saveProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}