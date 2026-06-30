import { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import useAuthListener from "../../hooks/useAuthListener";
import { toast } from "react-toastify";
import { CheckCircle, Plus, UploadCloud, Loader2 } from "lucide-react";
import VendorLayout from "../../layout/VendorLayout";
import "../../styles/AddProduct.css";

const SIZES_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42"];

const EMPTY_PRODUCT = {
  name: "", 
  category: "", 
  price: "", 
  stock: "",
  sizes: [], 
  condition: 7,
  chest: "", 
  length: "", 
  waist: "", 
  gender: "",
  brand: "", 
  color: "", 
  description: "",
};

export default function AddProduct() {
  const user = useAuthListener();

  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [images, setImages] = useState([null, null, null, null]);

  /* ── LOAD CATEGORIES ── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        setCategories(snap.docs.map(d => d.data().name));
      } catch (err) {
        console.error(err);
        toast.error("LOG ERROR: CATEGORY FETCH FAILED");
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
    if (file && file.size > 30 * 1024 * 1024)
      return toast.warn("FILE SIZE EXCEEDED: MAX 2MB");
    const updated = [...images];
    updated[index] = file || null;
    setImages(updated);
  };

  const addMoreImageField = () => setImages(prev => [...prev, null]);

  /* ── UPLOAD PROTOCOL ── */
  const uploadProduct = async () => {
    const validImages = images.filter(Boolean);

    if (!product.name || !product.category || !product.price || !product.stock)
      return toast.warning("NULL FIELD: REQUIRED DATA MISSING");
    if (validImages.length === 0)
      return toast.warning("NULL FIELD: ASSETS REQUIRED");
    if (!user?.uid)
      return toast.error("AUTH ERROR: SESSION EXPIRED");

    setIsUploading(true);

    try {
      const uploadedImages = [];
      const imagePaths = [];

      for (const file of validImages) {
        const path = `products/${user.uid}/${Date.now()} ${file.name}`;
        const imageRef = ref(storage, path);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        uploadedImages.push(url);
        imagePaths.push(path);
      }

      // Final object with Number casting for Security Rules
      const finalDoc = {
        name: product.name,
        category: product.category,
        brand: product.brand,
        color: product.color,
        description: product.description,
        chest: product.chest,
        length: product.length,
        gender: product.gender,
        sizes: product.sizes,
        status: "active",
        price: Number(product.price),
        stock: Number(product.stock),
        condition: Number(product.condition),
        waist: product.waist ? Number(product.waist) : null,
        shop_id: user.uid,
        vendor_email: user.email,
        images: uploadedImages,
        imagePaths: imagePaths,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "products"), finalDoc);

      toast.success("LOG SUCCESS: ENTRY SAVED TO ARCHIVE");
      setProduct(EMPTY_PRODUCT);
      setImages([null, null, null, null]);

    } catch (error) {
      console.error(error);
      toast.error(`SYSTEM ERROR: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
      <div className="ap-container">
        
        <header className="ap-header">
          <span className="ap-meta">// NEW ARCHIVE ENTRY: INITIALIZE FORM</span>
          <h1 className="ap-title">ADD NEW PRODUCT</h1>
          <p className="ap-subtitle">
            Authenticated: <span className="ap-accent">{user?.email}</span>
          </p>
        </header>

        <div className="ap-grid">
          {/* LEFT SECTION */}
          <section className="ap-section">
            <div className="ap-field">
              <label className="ap-label">PRODUCT NAME</label>
              <input
                className="ap-input"
                placeholder="Ex: Vintage 90s Denim"
                value={product.name}
                onChange={e => set("name", e.target.value)}
              />
            </div>

            <div className="ap-double">
              <div className="ap-field">
                <label className="ap-label">CATEGORY</label>
                <select
                  className="ap-input ap-select"
                  value={product.category}
                  onChange={e => set("category", e.target.value)}
                >
                  <option value="">SELECT...</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">BRAND</label>
                <input
                  className="ap-input"
                  value={product.brand}
                  onChange={e => set("brand", e.target.value)}
                />
              </div>
               <div className="ap-field">
    <label className="ap-label">COLOR</label>
    <input
      className="ap-input"
      placeholder="Ex: Black, Navy Blue, White"
      value={product.color}
      onChange={e => set("color", e.target.value)}
    />
  </div>
            </div>

            <div className="ap-triple">
              <div className="ap-field">
                <label className="ap-label">PRICE (₹)</label>
                <input
                  type="number"
                  className="ap-input"
                  value={product.price}
                  onChange={e => set("price", e.target.value)}
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">STOCK</label>
                <input
                  type="number"
                  className="ap-input"
                  value={product.stock}
                  onChange={e => set("stock", e.target.value)}
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">WAIST (IN)</label>
                <div className="ap-tagged">
                  <input
                    type="number"
                    className="ap-input"
                    value={product.waist}
                    onChange={e => set("waist", e.target.value)}
                  />
                  <span className="ap-tag">IN</span>
                </div>
              </div>
            </div>

            <div className="ap-double">
               <div className="ap-field">
                <label className="ap-label">CHEST (IN)</label>
                <input className="ap-input" value={product.chest} onChange={e => set("chest", e.target.value)} />
              </div>
              <div className="ap-field">
                <label className="ap-label">LENGTH (IN)</label>
                <input className="ap-input" value={product.length} onChange={e => set("length", e.target.value)} />
              </div>
            </div>

            <div className="ap-field">
              <label className="ap-label">DESCRIPTION</label>
              <textarea
                className="ap-input ap-textarea"
                rows="3"
                value={product.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
          </section>

          {/* RIGHT SECTION */}
          <section className="ap-section">
            <div className="ap-field">
              <label className="ap-label">GENDER</label>
              <select className="ap-input ap-select" value={product.gender} onChange={e => set("gender", e.target.value)}>
                <option value="">SELECT...</option>
                <option value="male">MALE</option>
                <option value="female">FEMALE</option>
                <option value="unisex">UNISEX</option>
              </select>
            </div>

            <div className="ap-field">
              <label className="ap-label">SIZES</label>
              <div className="ap-sizes">
                {SIZES_OPTIONS.map(size => (
                  <button
                    key={size} type="button"
                    className={`ap-size-btn ${product.sizes.includes(size) ? "active" : ""}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="ap-field">
              <label className="ap-label">CONDITION: {product.condition}/10</label>
              <input
                type="range" min="1" max="10"
                className="ap-range"
                value={product.condition}
                onChange={e => set("condition", e.target.value)}
              />
            </div>

            <div className="ap-field">
              <label className="ap-label">IMAGES</label>
              <div className="ap-images">
  {images.map((file, index) => (
    <div key={index} className="ap-slot">
      <input
        type="file"
        id={`img-${index}`}
        hidden
        accept="image/*"
        onChange={e => handleImageChange(index, e.target.files[0])}
      />

      <label htmlFor={`img-${index}`} className="ap-slot-label">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            className="ap-preview"
          />
        ) : (
          <UploadCloud size={22} />
        )}
      </label>
    </div>
  ))}

  <button
    type="button"
    className="ap-add-slot"
    onClick={addMoreImageField}
  >
    <Plus size={14} />
  </button>
</div>
            </div>

            <button
              className="ap-save"
              onClick={uploadProduct}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="animate-spin" /> : "SAVE PRODUCT"}
            </button>
          </section>
        </div>
      
    <VendorLayout></VendorLayout>
      </div>
      
  );
}