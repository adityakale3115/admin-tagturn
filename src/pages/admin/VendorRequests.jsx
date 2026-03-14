import { useEffect, useState, useCallback } from "react";
import { db } from "../../firebase/firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Check, X, Loader2 } from "lucide-react";
import "../../styles/VendorRequests.css";

export default function VendorRequests() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const auth = getAuth();

  /* ================= FETCH ALL VENDORS (Memoized) ================= */
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "vendors"));
      setVendors(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("FAILED_TO_LOAD_VENDOR_REQUESTS");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthReady(true);
      } else {
        toast.error("PLEASE_LOGIN_AS_ADMIN");
        setLoading(false);
      }
    });

    return () => unsub();
  }, [auth]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (authReady) {
      fetchVendors();
    }
  }, [authReady, fetchVendors]);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (vendorId, newStatus) => {
    setProcessingId(vendorId);
    try {
      await updateDoc(doc(db, "vendors", vendorId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      toast.success(`VENDOR_${newStatus.toUpperCase()}`);
      fetchVendors();
    } catch (err) {
      console.error(err);
      toast.error("STATUS_UPDATE_FAILED");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-layout-container">
      <AdminSidebar />
      
      {/* Added pl-page to respect the sidebar offset fixed earlier */}
      <div className="pl-page gl-table-wrapper">
        <header className="admin-header">
          <h1>Vendor Requests</h1>
          <p>Review and authorize store access requests.</p>
        </header>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={40} />
            <p>SYNCING_DATA...</p>
          </div>
        ) : (
          <table className="gl-table">
            <thead>
              <tr>
                <th>SHOP NAME</th>
                <th>EMAIL</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-msg">{"NO_PENDING_REQUESTS_FOUND"}</td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="gl-shop-name">{v.shopName || "N/A"}</td>
                    <td className="gl-email">{v.email}</td>
                    <td>
                      <span className={`gl-badge ${v.status}`}>
                        {v.status?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td className="gl-actions">
                      <button
                        className="approve"
                        disabled={processingId === v.id}
                        onClick={() => updateStatus(v.id, "approved")}
                      >
                        {processingId === v.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        {"APPROVE"}
                      </button>

                      <button
                        className="reject"
                        disabled={processingId === v.id}
                        onClick={() => updateStatus(v.id, "rejected")}
                      >
                        <X size={16} /> {"REJECT"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}