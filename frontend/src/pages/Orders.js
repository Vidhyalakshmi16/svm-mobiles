// src/pages/Orders.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyOrdersApi,
  getMyServiceRequests,
  cancelOrder,
  cancelServiceRequest,
} from "../services/api";
import api from "../services/axiosInstance"; // the one with token

import {
  FiSmartphone,
  FiTool,
  FiMapPin,
  FiPhone,
  FiClock,
  FiPackage,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activeType, setActiveType] = useState("orders"); // "orders" | "service"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "completed" | "cancelled"
  const [loading, setLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  // ---------- Fetch data ----------
useEffect(() => {
  const fetchAll = async () => {
    try {
      setLoading(true);

      const [ordersRes, serviceRes] = await Promise.all([
        getMyOrdersApi(),
        getMyServiceRequests(),
      ]);

      setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || []);
      setServiceRequests(
        Array.isArray(serviceRes) ? serviceRes : serviceRes?.data || []
      );
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, []);


  const formatINR = (num = 0) =>
    Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    return new Date(dt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ---------- Normalise status ----------
const getStatus = (item) => {
  const raw =
    item.status ||
    item.orderStatus ||
    item.serviceStatus ||
    "";

  const s = raw.toString().toLowerCase().trim();

  // PLACED
  if (["", "place", "placed"].includes(s)) {
    return "Placed";
  }

  // IN PROGRESS
  if (
    ["new", "pending", "processing", "assigned", "open", "in progress"].includes(s)
  ) {
    return "In Progress";
  }

  // COMPLETED
  if (["completed", "done", "closed", "resolved"].includes(s)) {
    return "Completed";
  }

  // CANCELLED
  if (["cancelled", "canceled"].includes(s)) {
    return "Cancelled";
  }

  // fallback
  return "Placed";
};


  // ---------- Status filter ----------
  const matchesStatusFilter = (item) => {
    const status = getStatus(item);
    const s = status.toLowerCase();

    if (statusFilter === "all") return true;
    if (statusFilter === "active")
      return s === "placed" || s === "in progress";
    if (statusFilter === "completed") return s === "completed";
    if (statusFilter === "cancelled") return s === "cancelled";

    return true;
  };

  const downloadInvoice = async (orderId) => {
  try {
    const res = await api.get(`/orders/${orderId}/invoice`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${orderId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Invoice download failed:", err);
    alert("Failed to download invoice");
  }
};
  // ---------- Build combined list ----------
const combined = [
  ...orders.map((o) => ({
    _type: "order",
    _uid: o._id || o.id,
    ...o,
  })),
  ...serviceRequests.map((s) => ({
    _type: "service",
    _uid: s._id || s.id || s.requestId,
    ...s,
  })),
].sort(
  (a, b) =>
    new Date(b.createdAt || b.created_on || 0) -
    new Date(a.createdAt || a.created_on || 0)
);


  const visibleCards = combined.filter((item) => {
    if (activeType === "orders" && item._type !== "order") return false;
    if (activeType === "service" && item._type !== "service") return false;
    return matchesStatusFilter(item);
  });

  // ---------- Cancel handler ----------
  const handleCancel = async (item) => {
    const status = getStatus(item);
    const s = status.toLowerCase();

    // only Placed can be cancelled
    if (s !== "placed") return;

    if (!window.confirm("Are you sure you want to cancel this?")) return;

    const key = item._type + "_" + item._uid;
    setCancelLoadingId(key);

    try {
if (item._type === "order") {
  await cancelOrder(item._uid);
  setOrders((prev) =>
    prev.map((o) =>
      o._id === item._uid ? { ...o, status: "cancelled" } : o
    )
  );
} else {
  await cancelServiceRequest(item._uid);
  setServiceRequests((prev) =>
    prev.map((s) =>
      s._id === item._uid ? { ...s, status: "cancelled" } : s
    )
  );
}
} finally {
      setCancelLoadingId(null);
    }
  };

  // ---------- AUTH GUARD PLACEHOLDER ----------
if (!user) {
  return (
    <div className="container mt-5 pt-4 order-page">
      <div className="text-center py-5">
        <FiPackage size={48} className="text-muted mb-3" />
        <h4 className="fw-bold mb-2">Your Orders & Service Requests</h4>
        <p className="text-muted mb-4">
          Login to track your orders, service requests, and download invoices.
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Link to="/auth" className="btn btn-dark px-4">
            Login
          </Link>
          <Link to="/products" className="btn btn-outline-dark px-4">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}


  // ---------- Loading / empty ----------
  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <p>Loading your orders & service requests...</p>
      </div>
    );
  }

  if (!combined || combined.length === 0) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <h3 className="fw-bold mb-2">Your Orders & Service Requests</h3>
        <p className="text-muted mb-4">
          You haven&apos;t placed any orders or service requests yet.
        </p>
        <Link to="/products" className="btn btn-dark">
          Browse Products
        </Link>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="container mt-5 pt-4 order-page">
      {/* Header + Filters */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-0">Your Activity</h3>
          <small className="text-muted">
            {combined.length} record{combined.length > 1 ? "s" : ""} &nbsp;•&nbsp;
            Orders & Service Requests
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* TYPE FILTER: Orders / Service */}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${
                activeType === "orders" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setActiveType("orders")}
            >
              Orders
            </button>
            <button
              className={`btn ${
                activeType === "service" ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setActiveType("service")}
            >
              Service
            </button>
          </div>

          {/* STATUS FILTER DROPDOWN */}
          <select
            className="form-select form-select-sm"
            style={{ width: "150px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="row g-3">
        {visibleCards.length === 0 ? (
    <div className="col-12">
      <div className="text-center py-5">
        <FiPackage size={40} className="text-muted mb-3" />
        <h5 className="fw-semibold">No records found</h5>
        <p className="text-muted mb-3">
          There are no {activeType === "orders" ? "orders" : "service requests"}{" "}
          matching this status.
        </p>

        {activeType === "orders" && (
          <Link to="/products" className="btn btn-dark btn-sm">
            Browse Products
          </Link>
        )}
      </div>
    </div>
  ) : (
    visibleCards.map((item) => {
      const isOrder = item._type === "order";
      const status = getStatus(item);
      const s = status.toLowerCase();

      const canCancel = s === "placed";
      const busy = cancelLoadingId === item._type + "_" + item._uid;

      const statusColorClass =
        status === "Completed"
          ? "status-pill success"
          : status === "Cancelled"
          ? "status-pill danger"
          : "status-pill warning";

      return (
            <div className="col-12 col-md-6 col-lg-4" key={item._uid}>
              <div className="order-card h-100">
                {/* Type + status */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="type-pill">
                      {isOrder ? (
                        <>
                          <FiPackage size={13} /> <span>Product Order</span>
                        </>
                      ) : (
                        <>
                          <FiTool size={13} /> <span>Service Request</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={statusColorClass}>{status}</span>
                </div>

                {/* ID + date */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div className="small text-muted">ID</div>
                    <div className="fw-semibold">
                      #{String(item._uid).slice(-8)}
                    </div>
                  </div>
                  <div className="text-end small text-muted">
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>

                <hr className="my-2" />

                {/* Middle content */}
                {isOrder ? (
                  <>
                    {/* Items */}
                    <div className="mb-2">
                      {item.items && item.items.length > 0 && (
                        <div className="d-flex align-items-center gap-2">
                          {item.items[0].image && (
                            <img
                              src={item.items[0].image}
                              alt={item.items[0].name}
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 10,
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <div>
                            <div className="small fw-semibold">
                              {item.items[0].name}
                            </div>
                            <div className="small text-muted">
                              {item.items.length > 1
                                ? `+ ${item.items.length - 1} more item${
                                    item.items.length > 2 ? "s" : ""
                                  }`
                                : `Qty: ${item.items[0].quantity}`}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="small text-muted mb-2">
                      <div className="fw-semibold text-dark mb-1">
                        Delivery to
                      </div>
                      {item.customer && (
                        <>
                          <div>{item.customer.name}</div>
                          <div className="d-flex align-items-start gap-1">
                            <FiMapPin size={12} className="mt-1" />
                            <span>
                              {item.customer.address}, {item.customer.city} -{" "}
                              {item.customer.pincode}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <FiPhone size={12} />
                            <span>{item.customer.phone}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Total */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="small text-muted">Order Total</div>
                      <div className="fw-bold text-success fs-6">
                        ₹{formatINR(item.total)}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Service details */}
                    <div className="small text-muted mb-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <FiSmartphone size={14} />
                        <span>
                        {item.mobileBrand || "Device"}{" "}
                        {item.mobileModel ? `• ${item.mobileModel}` : ""}
                        </span>
                      </div>
                      {item.issueType && (
                        <div className="mb-1">
                          <span className="fw-semibold text-dark">
                            Issue:&nbsp;
                          </span>
                          <span>{item.issueType}</span>
                        </div>
                      )}
                      {item.preferredDate && (
                        <div className="d-flex align-items-center gap-2">
                          <FiClock size={14} />
                          <span>
                            Preferred: {item.preferredDate}
                            {item.preferredTime
                              ? `, ${item.preferredTime}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Customer basics */}
                    <div className="small text-muted mb-2">
                      <div className="fw-semibold text-dark mb-1">
                        Customer
                      </div>
                      <div>{item.name}</div>
                      <div className="d-flex align-items-center gap-1">
                        <FiPhone size={12} />
                        <span>{item.phone}</span>
                      </div>
                      {item.address && (
                        <div className="d-flex align-items-start gap-1">
                          <FiMapPin size={12} className="mt-1" />
                          <span>{item.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    {item.message && (
                      <div
                        className="small text-muted mb-1"
                        style={{
                          maxHeight: 60,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        “{item.message}”
                      </div>
                    )}
                  </>
                )}

                <hr className="my-2" />

                {/* Footer actions */}
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <small className="text-muted">
                    {isOrder ? "Order" : "Service"} status:{" "}
                    <span className="fw-semibold text-dark">{status}</span>
                  </small>

                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill"
                    disabled={!canCancel || busy}
                    onClick={() => handleCancel(item)}
                    style={{ fontSize: "12px", paddingInline: "14px" }}
                  >
                    {busy ? "Cancelling..." : "Cancel"}
                  </button>
                </div>

                {/* Hint when in progress */}
                {status === "In Progress" && (
                  <div className="small text-muted mt-1 text-end">
                    For changes or issues, please contact the shop.
                  </div>
                )}

              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Local styles */}
      <style>{`
        .order-page {
          padding-bottom: 32px;
        }
        .order-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 14px 16px;
          border: 1px solid #edf0f7;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
          position: relative;
          overflow: hidden;
        }
        .order-card::before {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle at center, #111827 0, transparent 60%);
          opacity: 0.06;
        }
        .type-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 11px;
          background: linear-gradient(135deg, #111827, #4b5563);
          color: #f9fafb;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
        }
        .status-pill {
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-pill.success {
          background: #dcfce7;
          color: #166534;
        }
        .status-pill.danger {
          background: #fee2e2;
          color: #b91c1c;
        }
        .status-pill.warning {
          background: #fef9c3;
          color: #92400e;
        }

        @media (max-width: 576px) {
          .order-card {
            padding: 12px 12px;
          }
        }
      `}</style>
    </div>
  );
}


