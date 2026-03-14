import { useState, useRef } from "react";
import "../../styles/AddProduct.css";
import Sidebar from "../../components/vendor/VendorSidebar"

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42"];
const CATEGORIES = ["", "Tops", "Bottoms", "Outerwear", "Dresses", "Footwear", "Accessories"];
const CONDITIONS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function AddProduct() {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [condition, setCondition] = useState(4);
  const [imageSlots, setImageSlots] = useState([null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const fileRefs = useRef([]);

  const toggleSize = (size) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const handleFile = (index, file) => {
    if (!file) return;
    setImageSlots((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const addSlot = () => setImageSlots((prev) => [...prev, null]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
  };

  return (
    <div className="ap-container">
      <Sidebar />
      {/* ── HEADER ── */}
      <header className="ap-header">
        <span className="ap-meta">Gallery Lab / Inventory</span>
        <h1 className="ap-title">Add New Product</h1>
        <p className="ap-subtitle">
          Fill in the details below to list a new item in your{" "}
          <span className="ap-accent">collection.</span>
        </p>
      </header>

      {/* ── FORM GRID ── */}
      <div className="ap-grid">
        {/* ── LEFT SECTION ── */}
        <section className="ap-section">
          <div className="ap-field">
            <label className="ap-label">Product Name</label>
            <input className="ap-input" type="text" placeholder="e.g. Vintage Levi's 501" />
          </div>

          <div className="ap-field">
            <label className="ap-label">Description</label>
            <textarea className="ap-input ap-textarea" placeholder="Describe the item, story, details…" />
          </div>

          <div className="ap-double">
            <div className="ap-field">
              <label className="ap-label">Category</label>
              <select className="ap-input ap-select">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c || "Select…"}</option>
                ))}
              </select>
            </div>
            <div className="ap-field">
              <label className="ap-label">Brand</label>
              <input className="ap-input" type="text" placeholder="Brand name" />
            </div>
          </div>

          <div className="ap-triple">
            <div className="ap-field">
              <label className="ap-label">Price</label>
              <div className="ap-tagged">
                <input className="ap-input" type="number" placeholder="0" />
                <span className="ap-tag">₹</span>
              </div>
            </div>
            <div className="ap-field">
              <label className="ap-label">Compare At</label>
              <div className="ap-tagged">
                <input className="ap-input" type="number" placeholder="0" />
                <span className="ap-tag">₹</span>
              </div>
            </div>
            <div className="ap-field">
              <label className="ap-label">Stock</label>
              <input className="ap-input" type="number" placeholder="Qty" />
            </div>
          </div>

          <div className="ap-double">
            <div className="ap-field">
              <label className="ap-label">Weight</label>
              <div className="ap-tagged">
                <input className="ap-input" type="number" placeholder="0" />
                <span className="ap-tag">KG</span>
              </div>
            </div>
            <div className="ap-field">
              <label className="ap-label">SKU</label>
              <input className="ap-input" type="text" placeholder="GL-001" />
            </div>
          </div>

          <div className="ap-field">
            <div className="ap-label-row">
              <label className="ap-label">Condition</label>
              <span className="ap-badge">{CONDITIONS[condition - 1]}</span>
            </div>
            <input
              className="ap-range"
              type="range"
              min="1"
              max="5"
              value={condition}
              onChange={(e) => setCondition(Number(e.target.value))}
            />
            <div className="ap-range-labels">
              {CONDITIONS.map((c) => <span key={c}>{c}</span>)}
            </div>
          </div>
        </section>

        {/* ── RIGHT SECTION ── */}
        <section className="ap-section">
          <div className="ap-field">
            <label className="ap-label">Available Sizes</label>
            <div className="ap-sizes">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`ap-size-btn${selectedSizes.includes(s) ? " active" : ""}`}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="ap-field">
            <div className="ap-label-row">
              <label className="ap-label">Product Images</label>
              <span className="ap-count">{imageSlots.filter(Boolean).length} / {imageSlots.length}</span>
            </div>
            <div className="ap-images">
              {imageSlots.map((file, i) => (
                <label key={i} className={`ap-slot${file ? " has-file" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={(el) => (fileRefs.current[i] = el)}
                    onChange={(e) => handleFile(i, e.target.files[0])}
                  />
                  {file ? (
                    <div className="ap-slot-preview">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="ap-slot-img"
                      />
                      <span className="ap-slot-name">{file.name.slice(0, 18)}…</span>
                    </div>
                  ) : (
                    <div className="ap-slot-empty">
                      <UploadIcon />
                      <span>Upload</span>
                    </div>
                  )}
                </label>
              ))}

              <button type="button" className="ap-add-slot" onClick={addSlot}>
                <PlusIcon /> Add slot
              </button>
            </div>
          </div>

          <div className="ap-double">
            <div className="ap-field">
              <label className="ap-label">Color</label>
              <input className="ap-input" type="text" placeholder="e.g. Indigo Blue" />
            </div>
            <div className="ap-field">
              <label className="ap-label">Material</label>
              <input className="ap-input" type="text" placeholder="e.g. 100% Cotton" />
            </div>
          </div>

          <div className="ap-field">
            <label className="ap-label">Tags</label>
            <input className="ap-input" type="text" placeholder="vintage, casual, summer  (comma separated)" />
          </div>

          <button
            type="button"
            className="ap-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="ap-spinner" />
            ) : (
              <SaveIcon />
            )}
            <span>{saving ? "Saving…" : "Save Product"}</span>
          </button>
        </section>
      </div>
    </div>
  );
}