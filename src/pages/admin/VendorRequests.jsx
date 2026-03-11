import { useEffect, useState } from "react";
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

  /* ================= FETCH ALL VENDORS ================= */
  const fetchVendors = async () => {
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
  };

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

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (authReady) {
      fetchVendors();
    }
  }, [authReady]);

  /* ================= UI ================= */
  return (
    
    <div className="gl-table-wrapper">
      <AdminSidebar />
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
      {vendors.map((v) => (
        <tr key={v.id}>
          <td className="gl-shop-name">{v.shopName}</td>
          <td className="gl-email">{v.email}</td>
          <td>
            <span className={`gl-badge ${v.status}`}>
              {v.status?.toUpperCase()}
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
              APPROVE
            </button>

            <button
              className="reject"
              disabled={processingId === v.id}
              onClick={() => updateStatus(v.id, "rejected")}
            >
              <X size={16} /> REJECT
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}
