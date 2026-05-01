import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import EditProductModal from "../../components/EditProductModal";
import Sidebar from "../../components/vendor/VendorSidebar";
import {
  Trash2,
  Edit,
  Package,
  ShoppingBag,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";
import "../../styles/ProductsList.css";

import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async (user) => {
    try {
      if (!user) return;

      setLoading(true);

      console.log("Logged in user:", user.email);

      const q = query(
        collection(db, "products"),
        where("vendor_email", "==", user.email.toLowerCase())
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTH LISTENER ================= */
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadProducts(user);
      } else {
        console.log("No user logged in");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= DELETE PRODUCT ================= */
  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      if (product.imagePaths?.length) {
        for (const path of product.imagePaths) {
          await deleteObject(ref(storage, path));
        }
      }

      await deleteDoc(doc(db, "products", product.id));

      toast.success("Product deleted");

      const auth = getAuth();
      loadProducts(auth.currentUser);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  /* ================= MODAL ================= */
  const openModal = (p) => {
    setSelected(p);
    setShowModal(true);
  };

  const closeModal = (refresh) => {
    setShowModal(false);
    setSelected(null);

    if (refresh) {
      const auth = getAuth();
      loadProducts(auth.currentUser);
    }
  };

  /* ================= HELPERS ================= */
  const stockLabel = (s) => (s <= 10 ? "LOW" : s <= 50 ? "MED" : "OK");
  const stockMod = (s) => (s <= 10 ? "pl-low" : s <= 50 ? "pl-med" : "pl-ok");

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filtered = products.filter((p) => {
    const matchSearch = p.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchCat =
      filterCat === "All" || p.category === filterCat;

    return matchSearch && matchCat;
  });
  
  return (
    <div className="pl-shell">
      <Sidebar />

      <div className="pl-page">

        {/* ── HEADER ── */}
        <header className="pl-header">
          <div className="pl-header-top">
            <div className="pl-title-block">
              <span className="pl-eyebrow">Gallery Lab · Inventory</span>
              <h1 className="pl-title">
                <ShoppingBag size={22} strokeWidth={1.5} />
                Manage Products
              </h1>
            </div>
            <div className="pl-stats">
              <div className="pl-stat">
                <span className="pl-stat-num">{products.length}</span>
                <span className="pl-stat-lbl">Total</span>
              </div>
              <div className="pl-stat pl-stat-warn">
                <span className="pl-stat-num">{products.filter((p) => p.stock <= 10).length}</span>
                <span className="pl-stat-lbl">Low Stock</span>
              </div>
              <div className="pl-stat pl-stat-accent">
                <span className="pl-stat-num">{filtered.length}</span>
                <span className="pl-stat-lbl">Showing</span>
              </div>
            </div>
          </div>

          <div className="pl-controls">
            <div className="pl-search-wrap">
              <Search size={13} strokeWidth={1.5} className="pl-search-icon" />
              <input
                className="pl-search"
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="pl-filter-wrap">
              <SlidersHorizontal size={12} strokeWidth={1.5} className="pl-filter-icon" />
              <select
                className="pl-filter"
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* ── LOADING ── */}
        {loading ? (
          <div className="pl-loading">
            <div className="pl-spin" />
            <span>Loading inventory…</span>
          </div>

        ) : products.length === 0 ? (
          <div className="pl-empty">
            <Package size={40} strokeWidth={1} />
            <h3>No products yet</h3>
            <p>Add products to see them here.</p>
          </div>

        ) : (
          <>
            {/* ── DESKTOP TABLE ── */}
            <div className="pl-table-wrap">
              <table className="pl-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Sizes</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="pl-no-results">
                        No results for "{search}"
                      </td>
                    </tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id} className="pl-row">
                      <td className="pl-td-img">
                        <div className="pl-img-frame">
                          <img
                            src={p.images?.[0] || "/no-image.png"}
                            alt={p.name}
                            className="pl-img"
                          />
                        </div>
                      </td>
                      <td className="pl-td-name">
                        <span className="pl-name">{p.name}</span>
                      </td>
                      <td><span className="pl-cat">{p.category}</span></td>
                      <td className="pl-td-price">₹{p.price?.toLocaleString()}</td>
                      <td>
                        <div className="pl-sizes">
                          {p.sizes?.slice(0, 4).map((s, i) => (
                            <span key={i} className="pl-size">{s}</span>
                          ))}
                          {p.sizes?.length > 4 && (
                            <span className="pl-size pl-size-more">+{p.sizes.length - 4}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`pl-stock ${stockMod(p.stock)}`}>
                          <span className="pl-stock-dot" />
                          {p.stock} · {stockLabel(p.stock)}
                        </span>
                      </td>
                      <td>
                        <div className="pl-actions">
                          <button className="pl-btn pl-edit" onClick={() => openModal(p)}>
                            <Edit size={12} strokeWidth={2} /> Edit
                          </button>
                          <button className="pl-btn pl-del" onClick={() => deleteProduct(p)}>
                            <Trash2 size={12} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="pl-cards">
              {filtered.length === 0 ? (
                <div className="pl-no-results-card">No results for "{search}"</div>
              ) : filtered.map((p) => (
                <div key={p.id} className="pl-card">
                  <div className="pl-card-img-col">
                    <img
                      src={p.images?.[0] || "/no-image.png"}
                      alt={p.name}
                      className="pl-card-img"
                    />
                  </div>
                  <div className="pl-card-body">
                    <div className="pl-card-row1">
                      <span className="pl-cat">{p.category}</span>
                      <span className={`pl-stock ${stockMod(p.stock)}`}>
                        <span className="pl-stock-dot" />
                        {stockLabel(p.stock)}
                      </span>
                    </div>
                    <p className="pl-card-name">{p.name}</p>
                    <p className="pl-card-price">₹{p.price?.toLocaleString()}</p>
                    {p.sizes?.length > 0 && (
                      <div className="pl-sizes">
                        {p.sizes.slice(0, 5).map((s, i) => (
                          <span key={i} className="pl-size">{s}</span>
                        ))}
                        {p.sizes.length > 5 && (
                          <span className="pl-size pl-size-more">+{p.sizes.length - 5}</span>
                        )}
                      </div>
                    )}
                    <div className="pl-card-actions">
                      <button className="pl-btn pl-edit pl-btn-full" onClick={() => openModal(p)}>
                        <Edit size={12} strokeWidth={2} /> Edit
                      </button>
                      <button className="pl-btn pl-del" onClick={() => deleteProduct(p)}>
                        <Trash2 size={12} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showModal && (
          <EditProductModal show={showModal} product={selectedProduct} onClose={closeModal} />
        )}
      </div>
    </div>
  );
}