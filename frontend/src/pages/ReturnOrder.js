import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/axiosInstance";

export default function ReturnOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReturn = async () => {
    if (!reason.trim()) {
      alert("Please provide a return reason");
      return;
    }

    setLoading(true);

    try {
      await api.post("/returns", {
        orderId,
        reason,
        images,
        video,
        courierName,
        trackingNumber,
      });

      alert("Return request submitted successfully");
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

      <div className="card p-3">
        <div className="mb-3">
          <label className="form-label">Reason *</label>
          <textarea
            className="form-control"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image URLs (optional)</label>
          <input
            className="form-control"
            placeholder="Comma separated image URLs"
            onChange={(e) => setImages(e.target.value.split(","))}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Video URL (optional)</label>
          <input
            className="form-control"
            placeholder="Video proof URL"
            onChange={(e) => setVideo(e.target.value)}
          />
        </div>

        <hr />

        <h6>Courier Details (after shipping back)</h6>

        <div className="mb-2">
          <input
            className="form-control"
            placeholder="Courier name"
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            className="form-control"
            placeholder="Tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>

        <button
          className="btn btn-danger w-100"
          disabled={loading}
          onClick={submitReturn}
        >
          {loading ? "Submitting..." : "Submit Return"}
        </button>
      </div>
    </div>
  );
}
