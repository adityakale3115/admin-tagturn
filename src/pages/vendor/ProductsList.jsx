import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ref,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import VendorLayout from "../../layout/VendorLayout";
import EditProductModal from "../../components/EditProductModal";
import { Trash2, Edit, Package, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import "../../styles/ProductsList.css";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ---------------- LOAD PRODUCTS ---------------- */
  const loadProducts = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);

      const data = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE PRODUCT ---------------- */
  const deleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`))
      return;

    try {
      // 1️⃣ Delete images from Firebase Storage
      if (product.imagePaths?.length > 0) {
        for (const path of product.imagePaths) {
          await deleteObject(ref(storage, path));
        }
      }

      // 2️⃣ Delete Firestore document
      await deleteDoc(doc(db, "products", product.id));

      toast.success("Product deleted successfully");
      loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product");
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = (shouldRefresh) => {
    setShowModal(false);
    setSelectedProduct(null);
    if (shouldRefresh) loadProducts();
  };

  const getStockClass = (stock) => {
    if (stock <= 10) return "stock-low";
    if (stock <= 50) return "stock-medium";
    return "stock-high";
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <VendorLayout>
      <div className="products-page">

        {/* Page Header */}
        <div className="products-header">
          <h2 className="products-title">
            <ShoppingBag size={30} /> Manage Products
          </h2>
          <p className="products-subtext">
            View, update, and manage your inventory
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="loading-state">
            <p>Loading your inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={50} color="#cbd5e1" />
            </div>
            <h3>No products found</h3>
            <p>Add products to see them here.</p>
          </div>
        ) : (
          <div className="products-table-wrapper">

            {/* Info Bar */}
            <div className="table-info-bar">
              <span className="total-products">
                Total Products: <strong>{products.length}</strong>
              </span>
              <span>Showing all items</span>
            </div>

            {/* Products Table */}
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Sizes</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="product-img-cell">
                      <img
                        src={p.images?.[0] || "/no-image.png"}
                        alt={p.name}
                        className="product-table-img"
                      />
                    </td>

                    <td>{p.name}</td>

                    <td>
                      <span className="category-badge">
                        {p.category}
                      </span>
                    </td>

                    <td>₹{p.price}</td>

                    <td>
                      <div className="sizes-list">
                        {p.sizes?.map((size, i) => (
                          <span key={i} className="size-badge">
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <span className={`stock-cell ${getStockClass(p.stock)}`}>
                        {p.stock} units
                      </span>
                    </td>

                    <td>
                      <div className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openModal(p)}
                        >
                          <Edit size={14} /> Edit
                        </button>

                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteProduct(p)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <EditProductModal
          show={showModal}
          product={selectedProduct}
          onClose={closeModal}
        />
      )}
    </VendorLayout>
  );
}
