import React, { useEffect, useState } from "react";
import axios from "../services/axiosInstance";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/returns/admin");
      setReturns(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const updateStatus = async (id, status, note = "") => {
    try {
      await axios.patch(`/returns/admin/${id}/status`, { status, note });
      alert(`Status updated to ${status}`);
      fetchReturns();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PROCESSING: "warning",
      RETURN_REQUEST_APPROVED: "info",
      RECEIVED: "primary",
      REFUNDED: "success",
      REJECTED: "danger",
    };
    return badges[status] || "secondary";
  };

  const getStatusLabel = (status) => {
    const labels = {
      PROCESSING: "🔄 Processing",
      RETURN_REQUEST_APPROVED: "✅ Approved - Awaiting Package",
      RECEIVED: "📦 Product Received",
      REFUNDED: "💰 Refunded",
      REJECTED: "❌ Rejected",
    };
    return labels[status] || status;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Return Requests Management</h2>
        <button className="btn btn-primary btn-sm" onClick={fetchReturns}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : returns.length === 0 ? (
        <div className="alert alert-info">No return requests</div>
      ) : (
        <div className="row g-3">
          {returns.map((r) => (
            <div className="col-12 col-lg-6" key={r._id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="small text-muted">Return ID</div>
                      <div className="fw-bold">#{r._id.slice(-6)}</div>
                    </div>
                    <span className={`badge bg-${getStatusBadge(r.status)} p-2`}>
                      {getStatusLabel(r.status)}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="mb-3 p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h6 className="fw-bold mb-2">👤 Customer Details</h6>
                    <div className="small">
                      <div><b>Name:</b> {r.name || "-"}</div>
                      <div><b>Email:</b> {r.email || "-"}</div>
                      <div><b>Phone:</b> {r.phone || "-"}</div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="mb-3 p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h6 className="fw-bold mb-2">📦 Order Details</h6>
                    <div className="small">
                      <div><b>Order ID:</b> #{r.orderId?._id?.slice(-8)}</div>
                      <div><b>Total Amount:</b> ₹{r.orderId?.total?.toLocaleString("en-IN") || "N/A"}</div>
                      <div><b>Items:</b> {r.orderId?.items?.length || 0} product(s)</div>
                    </div>
                  </div>

                  {/* Return Reason */}
                  <div className="mb-3">
                    <b className="d-block mb-1">🎯 Reason for Return:</b>
                    <div className="small text-muted p-2 bg-light rounded">{r.reason}</div>
                  </div>

                  {/* Images */}
                  {r.images?.length > 0 && (
                    <div className="mb-3">
                      <b className="d-block mb-2">📸 Product Images:</b>
                      <div className="d-flex flex-wrap gap-2">
                        {r.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Product ${i}`}
                            onClick={() => window.open(img, "_blank")}
                            style={{
                              width: 70,
                              height: 70,
                              objectFit: "cover",
                              borderRadius: 8,
                              cursor: "pointer",
                              border: "1px solid #ddd",
                            }}
                            title="Click to view full image"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warehouse Address (if approved) */}
                  {(r.status === "RETURN_REQUEST_APPROVED" || r.status === "RECEIVED" || r.status === "REFUNDED") && r.warehouseAddress && (
                    <div className="mb-3 p-3" style={{ backgroundColor: "#e7f3ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
                      <h6 className="fw-bold mb-2">📮 Return Address</h6>
                      <div className="small">
                        <div><b>{r.warehouseAddress.name}</b></div>
                        <div>{r.warehouseAddress.address}</div>
                        <div>{r.warehouseAddress.city} - {r.warehouseAddress.pincode}</div>
                        <div><b>Phone:</b> {r.warehouseAddress.phone}</div>
                      </div>
                    </div>
                  )}

                  {/* Refund Details (if approved) */}
                  {r.refundAmount > 0 && (
                    <div className="mb-3 p-3" style={{ backgroundColor: "#fff3cd", borderRadius: "8px", border: "1px solid #ffc107" }}>
                      <h6 className="fw-bold mb-2">💰 Refund Amount</h6>
                      <div className="fs-5 fw-bold text-warning">₹{r.refundAmount.toLocaleString("en-IN")}</div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {r.adminNote && (
                    <div className="mb-3 p-2 bg-light border rounded small">
                      <b>📝 Admin Note:</b> {r.adminNote}
                    </div>
                  )}

                  {/* Status-based Actions */}
                  <div className="d-grid gap-2 mt-3">
                    {r.status === "PROCESSING" && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(r._id, "RETURN_REQUEST_APPROVED")}
                        >
                          ✅ Approve Return Request
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            const note = prompt("Enter reason for rejection:");
                            if (note !== null) {
                              updateStatus(r._id, "REJECTED", note);
                            }
                          }}
                        >
                          ❌ Reject Request
                        </button>
                      </>
                    )}

                    {r.status === "RETURN_REQUEST_APPROVED" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateStatus(r._id, "RECEIVED")}
                      >
                        📦 Mark as Received
                      </button>
                    )}

                    {r.status === "RECEIVED" && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => {
                          const ok = window.confirm(
                            `Process manual refund of ₹${r.refundAmount.toLocaleString("en-IN")}?\n\nMake sure you have sent the money to the customer.`
                          );
                          if (ok) {
                            updateStatus(r._id, "REFUNDED");
                          }
                        }}
                      >
                        💸 Manual Refund Processed
                      </button>
                    )}

                    {r.status === "REFUNDED" && (
                      <div className="alert alert-success mb-0 small">
                        ✅ Refund completed on {new Date(r.refundProcessedAt).toLocaleDateString()}
                      </div>
                    )}

                    {r.status === "REJECTED" && (
                      <div className="alert alert-danger mb-0 small">
                        ❌ Request rejected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
