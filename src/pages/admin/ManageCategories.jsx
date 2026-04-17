import { useEffect, useState, useCallback } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { toast } from "react-toastify";

import {
  FolderOpen,
  Trash2,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/ManageCategories.css";

export default function ManageCategories() {
  const [categoryName, setCategoryName] = useState("");
  const [parentSection, setParentSection] = useState("Mens");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editParentSection, setEditParentSection] = useState("Mens");

  /* ── LOAD ── */
  const loadCategories = useCallback(async () => {
    try {
      const q = query(
        collection(db, "categories"),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("DATA_FETCH_ERROR");
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /* ── ADD ── */
  const addCategory = async () => {
    if (!categoryName.trim())
      return toast.warning("ENTER_CATEGORY_NAME");

    setLoading(true);

    try {
      await addDoc(collection(db, "categories"), {
        name: categoryName.trim(),
        parentSection,
        createdAt: serverTimestamp(),
      });

      toast.success("CATEGORY_ADDED");

      setCategoryName("");
      setParentSection("Mens");

      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("ADD_FAILED");
    } finally {
      setLoading(false);
    }
  };

  /* ── DELETE ── */
  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "categories", cat.id));
      toast.success("CATEGORY_DELETED");
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("DELETE_FAILED");
    }
  };

  /* ── EDIT ── */
  const openEdit = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditParentSection(cat.parentSection || "Mens");
  };

  const saveEdit = async () => {
    if (!editingCategory) return;

    if (!editName.trim())
      return toast.warning("ENTER_CATEGORY_NAME");

    setLoading(true);

    try {
      await updateDoc(doc(db, "categories", editingCategory.id), {
        name: editName.trim(),
        parentSection: editParentSection,
      });

      toast.success("CATEGORY_UPDATED");
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("UPDATE_FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout-container">
      <AdminSidebar active="categories" />

      <main className="pl-page gl-main-content">
        <header className="gl-page-header">
          <h1>MANAGE CATEGORIES</h1>
        </header>

        {/* ADD */}
        <section className="gl-entry-section">
          <div className="gl-bento-entry">
            <input
              className="gl-input"
              placeholder="CATEGORY NAME"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            <select
              className="gl-input"
              value={parentSection}
              onChange={(e) => setParentSection(e.target.value)}
            >
              <option value="Mens">MEN'S</option>
              <option value="Womens">WOMEN'S</option>
              <option value="Accessories">ACCESSORIES</option>
            </select>

            <button
              className="gl-submit-btn"
              onClick={addCategory}
              disabled={loading}
            >
              {loading ? "PROCESSING..." : <><Plus /> ADD</>}
            </button>
          </div>
        </section>

        {/* GRID */}
        <div className="gl-category-grid">
          {categories.length === 0 ? (
            <div className="gl-empty-state">
              <FolderOpen size={40} />
              <p>NO CATEGORIES</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="gl-category-card">
                <div className="gl-card-content">
                  <div className="gl-cat-info">
                    <small className="gl-parent-tag">
                      {cat.parentSection}
                    </small>
                    <span>{cat.name.toUpperCase()}</span>
                  </div>

                  <div className="gl-card-actions">
                    <button onClick={() => openEdit(cat)}>
                      <Pencil size={14} />
                    </button>

                    <button onClick={() => deleteCategory(cat)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="gl-modal-overlay">
          <div className="gl-modal-box">
            <div className="gl-modal-header">
              <h3>EDIT CATEGORY</h3>
              <button onClick={() => setEditingCategory(null)}>
                <X />
              </button>
            </div>

            <input
              className="gl-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <select
              className="gl-input"
              value={editParentSection}
              onChange={(e) => setEditParentSection(e.target.value)}
            >
              <option value="Mens">MEN'S</option>
              <option value="Womens">WOMEN'S</option>
              <option value="Accessories">ACCESSORIES</option>
            </select>

            <button onClick={saveEdit}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}