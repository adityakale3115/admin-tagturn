import { useEffect, useState } from "react";
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import { toast } from "react-toastify";
import {
  FolderOpen,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Plus,
  X,
  Upload,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/ManageCategories.css";

/* =========================================================
   IMAGE UPLOAD HELPER
========================================================= */
const uploadImageWithName = async (file, folder, name) => {
  if (!file) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("ONLY_IMAGE_FILES_ALLOWED");
  }
  const ext = file.name.split(".").pop();
  const safeName = name.toLowerCase().replace(/\s+/g, "-");
  const filePath = `${folder}/${safeName}-${Date.now()}.${ext}`;
  const imageRef = ref(storage, filePath);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return { url, path: filePath };
};

export default function ManageCategories() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  // NEW: State for parent section selection
  const [parentSection, setParentSection] = useState("Mens"); 
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editParentSection, setEditParentSection] = useState("Mens");

  /* ================= LOAD ================= */
  const loadCategories = async () => {
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
  };

  /* ================= ADD ================= */
  const addCategory = async () => {
    if (!categoryName.trim()) return toast.warning("ENTER_CATEGORY_NAME");
    if (!categoryImage) return toast.warning("UPLOAD_CATEGORY_IMAGE");

    setLoading(true);
    try {
      const { url, path } = await uploadImageWithName(
        categoryImage,
        "category-images",
        categoryName
      );

      await addDoc(collection(db, "categories"), {
        name: categoryName.trim(),
        parentSection: parentSection, // Saving "Mens", "Womens", etc.
        image: url,
        imagePath: path,
        createdAt: serverTimestamp(),
      });

      toast.success("CATEGORY_ADDED");
      setCategoryName("");
      setCategoryImage(null);
      setParentSection("Mens"); // Reset to default
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("UPLOAD_FAILED");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      if (cat.imagePath) {
        await deleteObject(ref(storage, cat.imagePath));
      }
      await deleteDoc(doc(db, "categories", cat.id));
      toast.success("CATEGORY_DELETED");
      loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("DELETE_FAILED");
    }
  };

  /* ================= EDIT ================= */
  const openEdit = (cat) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditParentSection(cat.parentSection || "Mens");
    setEditImage(null);
  };

  const saveEdit = async () => {
    if (!editingCategory) return;
    if (!editName.trim()) return toast.warning("ENTER_CATEGORY_NAME");

    setLoading(true);
    try {
      let imageUrl = editingCategory.image;
      let imagePath = editingCategory.imagePath;

      if (editImage) {
        const upload = await uploadImageWithName(
          editImage,
          "category-images",
          editName
        );
        imageUrl = upload.url;
        imagePath = upload.path;

        if (editingCategory.imagePath) {
          await deleteObject(ref(storage, editingCategory.imagePath));
        }
      }

      await updateDoc(doc(db, "categories", editingCategory.id), {
        name: editName.trim(),
        parentSection: editParentSection,
        image: imageUrl,
        imagePath,
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

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="gl-admin-container">
      <AdminSidebar active="categories" />

      <main className="gl-main-content">
        <header className="gl-page-header">
          <span className="gl-meta">// CATEGORY_ARCHIVE_MGMT</span>
          <h1 className="gl-page-title">MANAGE CATEGORIES</h1>
        </header>

        {/* ADD SECTION */}
        <section className="gl-entry-section">
          <div className="gl-bento-entry">
            <input
              className="gl-input"
              placeholder="CATEGORY_NAME"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            {/* SELECT DROPDOWN FOR PARENT CATEGORY */}
            <select 
              className="gl-input gl-select"
              value={parentSection}
              onChange={(e) => setParentSection(e.target.value)}
            >
              <option value="Mens">MEN'S</option>
              <option value="Womens">WOMEN'S</option>
              <option value="Accessories">ACCESSORIES</option>
            </select>

            <input
              type="file"
              accept="image/*"
              hidden
              id="cat-img"
              onChange={(e) => setCategoryImage(e.target.files[0])}
            />

            <label htmlFor="cat-img" className="gl-upload-label">
              {categoryImage ? categoryImage.name : <><Upload /> UPLOAD</>}
            </label>

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
              <p>NO_CATEGORIES</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="gl-category-card">
                <img src={cat.image} alt={cat.name} />
                <div className="gl-card-content">
                  <div className="gl-cat-info">
                    <small className="gl-parent-tag">{cat.parentSection}</small>
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
              <h3>EDIT_CATEGORY</h3>
              <button onClick={() => setEditingCategory(null)} className="gl-close-x">
                <X />
              </button>
            </div>

            <div className="gl-modal-body">
              <label>CATEGORY NAME</label>
              <input
                className="gl-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <label>FOR WHOM?</label>
              <select 
                className="gl-input"
                value={editParentSection}
                onChange={(e) => setEditParentSection(e.target.value)}
              >
                <option value="Mens">MEN'S</option>
                <option value="Womens">WOMEN'S</option>
                <option value="Accessories">ACCESSORIES</option>
              </select>

              <input
                type="file"
                hidden
                id="edit-img"
                onChange={(e) => setEditImage(e.target.files[0])}
              />
              <label htmlFor="edit-img" className="gl-upload-label">
                {editImage ? editImage.name : <><ImageIcon /> CHANGE_IMAGE</>}
              </label>

              <button 
                className="gl-submit-btn" 
                onClick={saveEdit} 
                disabled={loading}
              >
                {loading ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}