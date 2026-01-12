import React, { useEffect, useState } from "react";
import axios from "../services/axiosInstance";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/returns/admin");
      setReturns(res.data || []);
    } catch (err) {
      alert("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/returns/admin/${id}/status`, { status });
      fetchReturns();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const processRefund = async (ret) => {
    const ok = window.confirm("Process refund and send money back?");
    if (!ok) return;

    try {
      // 1️⃣ Refund money via Razorpay
      await axios.post(`/orders/${ret.orderId._id}/refund`);

      // 2️⃣ Mark return as refunded
      await updateStatus(ret._id, "REFUNDED");

      alert("Refund completed successfully");
    } catch (err) {
      alert("Refund failed");
    }
  };

  const badge = (s) => {
    if (s === "APPROVED") return "success";
    if (s === "REJECTED") return "danger";
    if (s === "RECEIVED") return "primary";
    if (s === "REFUNDED") return "success";
    return "warning";
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-3">Return Requests</h3>

      {loading ? (
        <div className="text-center py-5">Loading…</div>
      ) : (
        <div className="row g-3">
          {returns.map((r) => (
            <div className="col-md-6 col-lg-4" key={r._id}>
              <div className="card shadow-sm rounded-4">
                <div className="card-body">

                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div className="small text-muted">Return ID</div>
                      <div className="fw-semibold">#{r._id.slice(-6)}</div>
                    </div>
                    <span className={`badge bg-${badge(r.status)}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="small mb-2">
                    <b>Order:</b> #{r.orderId?._id?.slice(-8)}
                  </div>

                  <div className="small mb-2">
                    <b>Customer:</b> {r.userId?.email}
                  </div>

                  <div className="mb-2">
                    <b>Reason:</b>
                    <div className="small text-muted">{r.reason}</div>
                  </div>

                  {r.images?.length > 0 && (
                    <div className="d-flex gap-2 mb-2">
                      {r.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt=""
                          onClick={() => window.open(img)}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="d-grid gap-2 mt-2">
                    {r.status === "REQUESTED" && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(r._id, "APPROVED")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(r._id, "REJECTED")}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {r.status === "APPROVED" && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => updateStatus(r._id, "IN_TRANSIT")}
                      >
                        Mark In Transit
                      </button>
                    )}

                    {r.status === "IN_TRANSIT" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateStatus(r._id, "RECEIVED")}
                      >
                        Mark Received
                      </button>
                    )}

                    {r.status === "RECEIVED" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => processRefund(r)}
                      >
                        Process Refund
                      </button>
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
