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
    <div className="container mt-5 pt-4">
      <h4 className="fw-bold mb-3">Return Product</h4>

      {/* 🔴 Return Rules */}
      <div className="alert alert-warning small">
        <b>Return Policy</b>
        <ul className="mb-0">
          <li>Only delivered items can be returned</li>
          <li>Refund will be only for product value (no delivery & platform fee)</li>
          <li>Product images are mandatory</li>
          <li>Unboxing video is optional but recommended</li>
          <li>You must courier the product back after approval</li>
        </ul>
      </div>

      <div className="card p-3 shadow-sm rounded-4">

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
                    onClick={() => removeImage(i)}
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      cursor: "pointer",
                    }}
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
          className="btn btn-danger w-100"
          disabled={loading}
          onClick={submitReturn}
        >
          {loading ? "Submitting..." : "Submit Return Request"}
        </button>
      </div>
    </div>
  );
}
