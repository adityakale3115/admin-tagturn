import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Trash2, Package } from "lucide-react";
import { toast } from "react-toastify";
import "../../styles/AdminListings.css";

export default function AdminListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(
        collection(db, "products")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (product) => {
    const ok = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!ok) return;

    try {
      await deleteDoc(
        doc(db, "products", product.id)
      );

      toast.success("Product deleted");

      setProducts((prev) =>
        prev.filter((p) => p.id !== product.id)
      );
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar active="listings" />

      <main className="admin-content">
        <div className="listing-header">
          <h1>All Listings</h1>
          <span>{products.length} Products</span>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <div className="empty">
            <Package size={40} />
            <p>No products found</p>
          </div>
        ) : (
          <div className="listing-grid">
            {products.map((p) => (
              <div className="listing-card" key={p.id}>
                <img
                  src={
                    p.images?.[0] ||
                    "/no-image.png"
                  }
                  alt={p.name}
                />

                <h3>{p.name}</h3>

                <p className="vendor">
                  {p.vendor_email}
                </p>

                <p className="price">
                  ₹{p.price}
                </p>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteProduct(p)
                  }
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}