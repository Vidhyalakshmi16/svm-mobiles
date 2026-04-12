import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/axiosInstance";

export default function ReturnOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [video, setVideo] = useState(""); // optional
  const [loading, setLoading] = useState(false);

  // Handle image selection
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // Remove selected image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const submitReturn = async () => {
    if (!name || !phone || !reason || images.length === 0) {
      alert("Name, phone, reason and product images are required");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("orderId", orderId);
      fd.append("name", name);
      fd.append("phone", phone);
      fd.append("reason", reason);
      fd.append("video", video || "");

      images.forEach((img) => fd.append("images", img));

      await api.post("/returns", fd);

      alert("Return request submitted. Please courier the product back.");
      navigate("/orders");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Return request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <p className="lux-eyebrow mb-1">Returns</p>
      <h1 className="store-page-title mb-3">Return a product</h1>

      <div
        className="rounded-3 p-3 p-md-4 mb-4 small"
        style={{
          background: "linear-gradient(135deg, rgba(254,243,199,0.85), rgba(255,251,235,0.95))",
          border: "1px solid rgba(180,83,9,0.25)",
          color: "#78350f",
        }}
      >
        <strong className="d-block mb-2">Return policy</strong>
        <ul className="mb-0 ps-3">
          <li>Only delivered items can be returned</li>
          <li>Refund covers product value only (not delivery or platform fee)</li>
          <li>Product images are mandatory</li>
          <li>Unboxing video is optional but recommended</li>
          <li>You must courier the product back after approval</li>
        </ul>
      </div>

      <div className="store-panel p-4 lux-form">

        <div className="mb-3">
          <label className="form-label">Your Name *</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number *</label>
          <input
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Reason for Return *</label>
          <textarea
            className="form-control"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Image upload */}
        <div className="mb-3">
          <label className="form-label">Product Images *</label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="form-control"
            onChange={handleImagesChange}
          />

          {imagePreviews.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {imagePreviews.map((src, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img
                    src={src}
                    alt="preview"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <button
                    type="button"
                    className="position-absolute top-0 end-0 m-1 border-0 rounded-circle text-white small fw-bold"
                    style={{
                      width: 26,
                      height: 26,
                      background: "#b91c1c",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional video */}
        <div className="mb-3">
          <label className="form-label">Unboxing Video (optional)</label>
          <input
            className="form-control"
            placeholder="Google Drive link"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="store-btn-primary w-100 mt-2"
          disabled={loading}
          onClick={submitReturn}
        >
          {loading ? "Submitting…" : "Submit return request"}
        </button>
      </div>
    </div>
  );
}
