import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/axiosInstance";

export default function ReturnOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [images, setImages] = useState("");
  const [video, setVideo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReturn = async () => {
    if (!name || !phone || !reason || !images) {
      alert("Name, phone, reason and images are required");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/orders/${orderId}/return`, {
        name,
        phone,
        reason,
        images: images.split(","),
        video,
      });

      alert("Return request submitted. Please courier the product back to us.");
      navigate("/orders");
    } catch (err) {
      alert(err.response?.data?.message || "Return request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 pt-4">
      <h4 className="fw-bold mb-3">Return Product</h4>

      {/* 🔴 Return Policy */}
      <div className="alert alert-warning small">
        <b>Return Policy:</b>
        <ul className="mb-0">
          <li>Only delivered products can be returned</li>
          <li>Refund will be only for product value (no delivery or platform fee)</li>
          <li>Product images are mandatory (video is optional but recommended)</li>
          <li>You must courier the product back after submitting this form</li>
        </ul>
      </div>

      <div className="card p-3">
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
          <label className="form-label">Return Reason *</label>
          <textarea
            className="form-control"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Product Images (comma separated URLs) *</label>
          <input
            className="form-control"
            placeholder="https://img1, https://img2"
            value={images}
            onChange={(e) => setImages(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Unboxing Video URL </label>
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
