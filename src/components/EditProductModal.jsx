import { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { X, CheckCircle, Image } from "lucide-react";

export default function EditProductModal({ show, onClose, product }) {

  const sizeOptions = ["S", "M", "L", "XL", "XXL"];

  const [updated, setUpdated] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load product values into modal
  useEffect(() => {
    if (product) {
      setUpdated(product);
    }
  }, [product]);

  // Fetch categories from DB
  useEffect(() => {
    const loadCategories = async () => {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    loadCategories();
  }, []);

  if (!show) return null;

  const toggleSize = (size) => {
    let updatedSizes = updated.sizes ? [...updated.sizes] : [];

    if (updatedSizes.includes(size)) {
      updatedSizes = updatedSizes.filter((s) => s !== size);
    } else {
      updatedSizes.push(size);
    }

    setUpdated({ ...updated, sizes: updatedSizes });
  };

  const handleImageUpload = (files) => {
    setNewImages([...files]);
  };

  const handleSave = async () => {
    let finalImages = updated.images || [];

    try {
      if (newImages.length > 0) {
        finalImages = [];
        for (const img of newImages) {
          const imgRef = ref(storage, `products/${Date.now()}-${img.name}`);
          await uploadBytes(imgRef, img);
          const url = await getDownloadURL(imgRef);
          finalImages.push(url);
        }
      }

      await updateDoc(doc(db, "products", product.id), {
        ...updated,
        images: finalImages,
      });

      toast.success("Product updated successfully!");
      onClose(true);

    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  /* ---------------- STYLES LEFT UNTOUCHED BELOW ---------------- */

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px', animation: 'fadeIn 0.3s ease-out'
  };

  const modalBoxStyle = {
    background: 'white', borderRadius: '24px', maxWidth: '600px',
    width: '100%', maxHeight: '90vh', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideUp 0.3s ease-out', display: 'flex', flexDirection: 'column'
  };

  const headerStyle = {
    padding: '24px 28px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
  };

  const titleStyle = { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 };
  const closeButtonStyle = { width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#f1f5f9', cursor: 'pointer' };
  const contentStyle = { padding: '28px', overflowY: 'auto', flex: 1 };
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', marginTop: '16px' };

  const inputStyle = {
    width: '100%', padding: '12px', fontSize: '15px',
    border: '2px solid #e2e8f0', borderRadius: '12px',
    outline: 'none', transition: '0.3s'
  };

  const sizesBoxStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px"
  };

  const checkboxStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    background: "#f8fafc",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    border: "1px solid #e2e8f0"
  };

  const currentImagesStyle = { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' };
  const productPreviewStyle = { width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '2px solid #f1f5f9' };

  const actionsStyle = { padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' };
  const btn = { padding: '12px 22px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 };

  const cancelBtn = { ...btn, background: '#e2e8f0' };
  const saveBtn = { ...btn, background: '#0891b2', color: 'white' };

  const keyframes = `
  @keyframes fadeIn {from{opacity:0} to{opacity:1}} 
  @keyframes slideUp {from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)}}
  `;

  return (
    <>
      <style>{keyframes}</style>

      <div style={overlayStyle} onClick={() => onClose(false)}>
        <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div style={headerStyle}>
            <h2 style={titleStyle}>Edit Product</h2>
            <button style={closeButtonStyle} onClick={() => onClose(false)}>
              <X size={22} />
            </button>
          </div>

          {/* Content Form */}
          <div style={contentStyle}>

            <label style={labelStyle}>Product Name</label>
            <input style={inputStyle} value={updated.name || ""} onChange={(e) => setUpdated({ ...updated, name: e.target.value })} />

            <label style={labelStyle}>Price (₹)</label>
            <input style={inputStyle} type="number" value={updated.price || ""} onChange={(e) => setUpdated({ ...updated, price: e.target.value })} />

            <label style={labelStyle}>Stock</label>
            <input style={inputStyle} type="number" value={updated.stock || ""} onChange={(e) => setUpdated({ ...updated, stock: e.target.value })} />

            {/* CATEGORY DROPDOWN */}
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={updated.category || ""} onChange={(e) => setUpdated({ ...updated, category: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* SIZE CHECKBOXES */}
            <label style={labelStyle}>Sizes</label>
            <div style={sizesBoxStyle}>
              {sizeOptions.map((size) => (
                <label key={size} style={checkboxStyle}>
                  <input
                    type="checkbox"
                    checked={updated.sizes?.includes(size) || false}
                    onChange={() => toggleSize(size)}
                  />
                  {size}
                </label>
              ))}
            </div>

            {/* IMAGES */}
            <label style={labelStyle}>Current Images</label>
            <div style={currentImagesStyle}>
              {(updated.images || []).map((img, i) => (
                <img key={i} src={img} alt="product" style={productPreviewStyle} />
              ))}
            </div>

            <label style={labelStyle}>Replace Images</label>
            <input type="file" multiple onChange={(e) => handleImageUpload([...e.target.files])} style={inputStyle} />

            {newImages.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <p><strong>New Images:</strong></p>
                {newImages.map((file, i) => (
                  <p key={i}><Image size={16} /> {file.name}</p>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div style={actionsStyle}>
            <button style={cancelBtn} onClick={() => onClose(false)}>Cancel</button>
            <button style={saveBtn} onClick={handleSave}><CheckCircle size={18}/> Save Changes</button>
          </div>
        </div>
      </div>
    </>
  );
}
