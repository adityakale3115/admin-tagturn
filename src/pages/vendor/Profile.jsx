import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import useAuthListener from "../../hooks/useAuthListener";
import { toast } from "react-toastify";
import {
  Camera,
  MapPin,
  Phone,
  Hash,
  Store,
  ShieldCheck,
  Upload,
} from "lucide-react";
import VendorLayout from "../../layout/VendorLayout";
import "../../styles/Profile.css";

export default function Profile() {
  const user = useAuthListener();
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    shopName: "",
    phone: "",
    address: "",
    gst: "",
    shopLogo: "",
    shopBanner: "",
  });

  const [newLogo, setNewLogo] = useState(null);
  const [newBanner, setNewBanner] = useState(null);
  const [previews, setPreviews] = useState({ logo: null, banner: null });

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    const userId = user?.uid;
    if (!userId) return;

    try {
      const snap = await getDoc(doc(db, "vendors", userId));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  /* ---------------- FILE HANDLING ---------------- */
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "logo") {
      setNewLogo(file);
      setPreviews((p) => ({ ...p, logo: URL.createObjectURL(file) }));
    } else {
      setNewBanner(file);
      setPreviews((p) => ({ ...p, banner: URL.createObjectURL(file) }));
    }
  };

  /* ---------------- UPLOAD IMAGE ---------------- */
  const uploadImage = async (file, type) => {
    if (!file) return null;

    const userId = user?.uid;
    const filePath = `vendors/${userId}/${type}-${Date.now()}-${file.name}`;
    const imageRef = ref(storage, filePath);

    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const saveProfile = async () => {
    const userId = user?.uid;
    if (!userId) return toast.error("AUTH_ERROR: SESSION_EXPIRED");

    setLoading(true);
    try {
      let logoUrl = profile.shopLogo;
      let bannerUrl = profile.shopBanner;

      if (newLogo) logoUrl = await uploadImage(newLogo, "logo");
      if (newBanner) bannerUrl = await uploadImage(newBanner, "banner");

      await setDoc(
        doc(db, "vendors", userId),
        {
          shopName: profile.shopName,
          phone: profile.phone,
          address: profile.address,
          gst: profile.gst,
          shopLogo: logoUrl,
          shopBanner: bannerUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success("SYSTEM_LOG: IDENTITY_UPDATED");
      fetchProfile();
      setNewLogo(null);
      setNewBanner(null);
      setPreviews({ logo: null, banner: null });
    } catch (err) {
      console.error(err);
      toast.error("SYNC_ERROR: UPDATE_FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div className="gl-profile-wrapper">
        <header className="gl-v-header">
          <span className="gl-v-meta">// IDENTITY_MANAGEMENT: SECURE_CORE</span>
          <h1 className="gl-v-welcome">SHOP PROFILE</h1>
          <p className="gl-v-subtitle">
            Configure public-facing store identity and verified business credentials.
          </p>
        </header>

        <div className="gl-profile-card">
          {/* Media */}
          <section className="gl-media-grid">
            <div className="gl-banner-box">
              <img
                src={
                  previews.banner ||
                  profile.shopBanner ||
                  "https://via.placeholder.com/1200x400?text=NO_ASSET_LOADED"
                }
                className="gl-banner-img"
                alt="Banner"
              />
              <label className="gl-banner-upload-btn">
                <Upload size={14} /> <span>REPLACE_BANNER_ASSET</span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "banner")}
                />
              </label>
            </div>

            <div className="gl-logo-overlay">
              <div className="gl-logo-frame">
                <img
                  src={
                    previews.logo ||
                    profile.shopLogo ||
                    "https://via.placeholder.com/150?text=LOGO"
                  }
                  className="gl-logo-img"
                  alt="Logo"
                />
                <label className="gl-logo-upload-btn">
                  <Camera size={14} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Form */}
          <div className="gl-profile-form">
            <div className="gl-form-grid">
              <div className="gl-input-group">
                <label className="gl-label">
                  <Store size={14} /> REGISTERED_SHOP_NAME
                </label>
                <input
                  className="gl-input"
                  value={profile.shopName}
                  onChange={(e) =>
                    setProfile({ ...profile, shopName: e.target.value })
                  }
                />
              </div>

              <div className="gl-input-group">
                <label className="gl-label">
                  <Phone size={14} /> CONTACT_COMM_KEY
                </label>
                <input
                  className="gl-input"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>

              <div className="gl-input-group">
                <label className="gl-label">
                  <Hash size={14} /> GST_VERIFICATION_ID
                </label>
                <input
                  className="gl-input"
                  value={profile.gst}
                  onChange={(e) =>
                    setProfile({ ...profile, gst: e.target.value })
                  }
                />
              </div>

              <div className="gl-input-group gl-full-width">
                <label className="gl-label">
                  <MapPin size={14} /> PHYSICAL_NODE_LOCATION
                </label>
                <textarea
                  className="gl-textarea"
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              className="gl-save-btn"
              onClick={saveProfile}
              disabled={loading}
            >
              {loading ? "PROCESSING_SYNC..." : (
                <>
                  <ShieldCheck size={18} /> COMMIT_IDENTITY_UPDATE
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
