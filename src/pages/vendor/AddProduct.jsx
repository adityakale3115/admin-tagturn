import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
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
import { CheckCircle, Plus, UploadCloud, Loader2 } from "lucide-react";
import VendorLayout from "../../layout/VendorLayout";
import "../../styles/AddProduct.css";

const SIZES_OPTIONS = ["S", "M", "L", "XL", "XXL"];

const EMPTY_PRODUCT = {
  name: "", category: "", price: "", stock: "",
  sizes: [], condition: 7,
  chest: "", length: "", gender: "",
  brand: "", color: "", description: "",
};

export default function AddProduct() {
  const user = useAuthListener();

  const [categories, setCategories]   = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [product, setProduct]         = useState(EMPTY_PRODUCT);
  const [images, setImages]           = useState([null, null, null]);

  /* ── load categories ── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        setCategories(snap.docs.map(d => d.data().name));
      } catch (err) {
        console.error(err);
        toast.error("LOG_ERROR: CATEGORY_FETCH_FAILED");
      }
    };
    fetchCategories();
  }, []);

  const set = (key, val) => setProduct(prev => ({ ...prev, [key]: val }));

  const toggleSize = (size) =>
    set("sizes", product.sizes.includes(size)
      ? product.sizes.filter(s => s !== size)
      : [...product.sizes, size]);

  const handleImageChange = (index, file) => {
    if (file && file.size > 2 * 1024 * 1024)
      return toast.warn("FILE_SIZE_EXCEEDED: MAX 2MB");
    const updated = [...images];
    updated[index] = file || null;
    setImages(updated);
  };

  const addMoreImageField = () => setImages(prev => [...prev, null]);

  /* ── upload ── */
  const uploadProduct = async () => {
    const validImages = images.filter(Boolean);

    if (!product.name || !product.category || !product.price || !product.stock)
      return toast.warning("NULL_FIELD: REQUIRED_DATA_MISSING");
    if (product.sizes.length === 0)
      return toast.warning("NULL_FIELD: DIMENSIONS_REQUIRED");
    if (validImages.length === 0)
      return toast.warning("NULL_FIELD: ASSETS_REQUIRED");
    if (!user?.uid)
      return toast.error("AUTH_ERROR: SESSION_EXPIRED");

    setIsUploading(true);

    try {
      const uploadedImages = [];

      for (const file of validImages) {
        const imagePath = `products/${user.uid}/${Date.now()}_${file.name}`;
        const imageRef  = ref(storage, imagePath);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        uploadedImages.push({ url, path: imagePath });
      }

      await addDoc(collection(db, "products"), {
        name:         product.name,
        category:     product.category,
        price:        Number(product.price),
        stock:        Number(product.stock),
        brand:        product.brand,
        color:        product.color,
        description:  product.description,
        chest:        product.chest,
        length:       product.length,
        gender:       product.gender,
        shop_id:      user.uid,
        vendor_email: user.email,
        status:       "active",
        sizes:        product.sizes,
        condition:    Number(product.condition),
        images:       uploadedImages.map(i => i.url),
        imagePaths:   uploadedImages.map(i => i.path),
        createdAt:    serverTimestamp(),
      });

      toast.success("LOG_SUCCESS: ENTRY_SAVED_TO_ARCHIVE");
      setProduct(EMPTY_PRODUCT);
      setImages([null, null, null]);

    } catch (error) {
      console.error(error);
      toast.error("SYSTEM_ERROR: UPLOAD_PROTOCOL_FAILED");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <VendorLayout>
      <div className="gl-add-product-container">

        {/* ── HEADER ── */}
        <header className="gl-v-header">
          <span className="gl-v-meta">// NEW_ARCHIVE_ENTRY: INITIALIZE_FORM</span>
          <h1 className="gl-v-welcome">ADD NEW PRODUCT</h1>
          <p className="gl-v-subtitle">
            Authenticated as: <span className="gl-v-email">{user?.email}</span>
          </p>
        </header>

        <div className="gl-form-grid">

          {/* ══ LEFT: SPECS ══ */}
          <div className="gl-form-section">

            {/* name */}
            <div className="gl-input-group">
              <label className="gl-label">PRODUCT_IDENTIFIER</label>
              <input
                className="gl-input"
                placeholder="Ex: Cyber-Mesh Oversized Tee"
                value={product.name}
                onChange={e => set("name", e.target.value)}
              />
            </div>

            {/* category + price */}
            <div className="gl-double-grid">
              <div className="gl-input-group">
                <label className="gl-label">CATEGORY</label>
                <select
                  className="gl-select"
                  value={product.category}
                  onChange={e => set("category", e.target.value)}
                >
                  <option value="">SELECT_TYPE</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="gl-input-group">
                <label className="gl-label">UNIT_VALUATION (₹)</label>
                <input
                  type="number"
                  className="gl-input"
                  value={product.price}
                  onChange={e => set("price", e.target.value)}
                />
              </div>
            </div>

            {/* stock */}
            <div className="gl-input-group">
              <label className="gl-label">INITIAL_INVENTORY_STOCK</label>
              <input
                type="number"
                className="gl-input"
                value={product.stock}
                onChange={e => set("stock", e.target.value)}
              />
            </div>

            {/* condition */}
            <div className="gl-input-group">
              <div className="gl-label-flex">
                <label className="gl-label">ITEM_CONDITION_RATING</label>
                <span className="gl-condition-badge">{product.condition}/10</span>
              </div>
              <div className="gl-condition-control">
                <input
                  type="range" min="1" max="10" step="1"
                  className="gl-range-input"
                  value={product.condition}
                  onChange={e => set("condition", e.target.value)}
                />
                <div className="gl-range-labels">
                  <span>POOR</span><span>FAIR</span><span>EXCELLENT</span>
                </div>
              </div>
            </div>

            {/* gender */}
            <div className="gl-input-group">
              <label className="gl-label">TARGET_GENDER</label>
              <select
                className="gl-select"
                value={product.gender}
                onChange={e => set("gender", e.target.value)}
              >
                <option value="">SELECT_GENDER</option>
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
                <option value="unisex">UNISEX</option>
              </select>
            </div>

            {/* measurements */}
            <div className="gl-input-group">
              <label className="gl-label">MEASUREMENTS (INCHES)</label>
              <div className="gl-double-grid">
                <div className="gl-measurement-field">
                  <input
                    type="text" className="gl-input"
                    placeholder="Chest (e.g. 21)"
                    value={product.chest}
                    onChange={e => set("chest", e.target.value)}
                  />
                  <span className="gl-input-tag">CHEST</span>
                </div>
                <div className="gl-measurement-field">
                  <input
                    type="text" className="gl-input"
                    placeholder="Length (e.g. 28)"
                    value={product.length}
                    onChange={e => set("length", e.target.value)}
                  />
                  <span className="gl-input-tag">LENGTH</span>
                </div>
              </div>
            </div>

            {/* sizes */}
            <div className="gl-input-group">
              <label className="gl-label">AVAILABLE_DIMENSIONS</label>
              <div className="gl-size-grid">
                {SIZES_OPTIONS.map(size => (
                  <button
                    key={size} type="button"
                    className={`gl-size-btn ${product.sizes.includes(size) ? "active" : ""}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* brand */}
            <div className="gl-input-group">
              <label className="gl-label">BRAND</label>
              <input
                className="gl-input"
                placeholder="Ex: Nike, Zara, H&M"
                value={product.brand}
                onChange={e => set("brand", e.target.value)}
              />
            </div>

            {/* color */}
            <div className="gl-input-group">
              <label className="gl-label">COLOR</label>
              <input
                className="gl-input"
                placeholder="Ex: Black, Blue, White"
                value={product.color}
                onChange={e => set("color", e.target.value)}
              />
            </div>

            {/* description */}
            <div className="gl-input-group">
              <label className="gl-label">PRODUCT_DESCRIPTION</label>
              <textarea
                className="gl-input gl-textarea"
                rows="4"
                placeholder="Write product details, material, fit, etc..."
                value={product.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>

          </div>

          {/* ══ RIGHT: MEDIA + SUBMIT ══ */}
          <div className="gl-form-section">

            <div className="gl-input-group">
              <label className="gl-label">VISUAL_ASSETS (MAX 2MB PER FILE)</label>
              <div className="gl-image-upload-grid">
                {images.map((file, index) => (
                  <div key={index} className={`gl-image-slot ${file ? "has-file" : ""}`}>
                    <input
                      type="file"
                      id={`img-${index}`}
                      hidden
                      accept="image/*"
                      onChange={e => handleImageChange(index, e.target.files[0])}
                    />
                    <label htmlFor={`img-${index}`} className="gl-image-label">
                      {file ? (
                        <div className="gl-image-preview">
                          <CheckCircle size={16} color="var(--primary)" />
                          <span>{file.name.slice(0, 10)}…</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud size={20} />
                          <span>ASSET_0{index + 1}</span>
                        </>
                      )}
                    </label>
                  </div>
                ))}

                <button type="button" className="gl-add-slot-btn" onClick={addMoreImageField}>
                  <Plus size={14} /> ADD_SLOT
                </button>
              </div>
            </div>

            <button
              className="gl-save-button"
              onClick={uploadProduct}
              disabled={isUploading}
            >
              {isUploading
                ? <><Loader2 size={18} className="animate-spin" /> UPLOADING_ASSETS...</>
                : <><CheckCircle size={18} /> INITIALIZE_CATALOG_SYNC</>
              }
            </button>

          </div>
        </div>
      </div>
    </VendorLayout>
  );
}