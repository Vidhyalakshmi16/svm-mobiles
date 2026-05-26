import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getMyOrdersApi,
  getMyServiceRequests,
  cancelOrder,
  retryPaymentApi,
  verifyPaymentApi,
} from "../services/api";

import {
  FiSmartphone,
  FiTool,
  FiMapPin,
  FiPhone,
  FiClock,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

const getStatus = (item) => {
  if (item._type === "order") {
    switch (item.status) {
      case "PAYMENT_PENDING":
        return "Payment Pending";
      case "FAILED":
        return "Failed";
      case "PAID":
        return "Paid";
      case "IN_PROGRESS":
      case "IN PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
      case "CANCELED":
        return "Cancelled";
      case "RETURNED":
        return "Returned";
      case "REFUND_PROCESSING":
        return "Refund Processing";
      case "REFUNDED":
        return "Refunded";
      default:
        return item.status || "Pending";
    }
  }

  const status = String(item.status || item.statusText || "").toLowerCase();
  if (["new", "assigned", "open", "in progress", "pending"].includes(status)) {
    return "In Progress";
  }

  if (["completed", "closed", "resolved"].includes(status)) {
    return "Completed";
  }

  if (["cancelled", "canceled"].includes(status)) {
    return "Cancelled";
  }

  return "In Progress";
};

const getStatusClass = (status) => {
  const slug = String(status || "").toLowerCase().replace(/\s+/g, "-");
  return `mv-orders-status-${slug}`;
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activeType, setActiveType] = useState("orders");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
      } catch (error) {
        console.error("Orders fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatINR = (value = 0) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const matchesStatusFilter = (item) => {
    const status = getStatus(item).toLowerCase().replace(/\s+/g, "-");
    return statusFilter === "all" || status === statusFilter;
  };

  const retryPayment = async (orderId) => {
    try {
      const response = await retryPaymentApi({ orderId });
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: response.amount,
        currency: "INR",
        order_id: response.razorpayOrderId,
        name: "Sri Vaari Mobiles",
        description: "Retry Order Payment",
        handler: async (res) => {
          const result = await verifyPaymentApi({ ...res, orderId });
          if (result) {
            window.location.reload();
          } else {
            alert("Payment verification failed");
          }
        },
        theme: { color: "#7d5f0c" },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      alert(error.response?.data?.message || "Retry failed");
    }
  };

  const handleCancel = async (item) => {
    if (item._type !== "order") return;
    if (getStatus(item).toLowerCase() !== "paid") return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    const key = `${item._type}_${item._uid}`;
    setCancelLoadingId(key);

    try {
      await cancelOrder(item._uid);
      setOrders((previous) =>
        previous.map((order) =>
          order._id === item._uid ? { ...order, status: "REFUND_PROCESSING" } : order
        )
      );
    } catch (error) {
      console.error("Cancel order failed:", error);
    } finally {
      setCancelLoadingId(null);
    }
  };

  const combined = [
    ...orders.map((order) => ({
      _type: "order",
      _uid: order._id || order.id,
      ...order,
    })),
    ...serviceRequests.map((request) => ({
      _type: "service",
      _uid: request._id || request.id || request.requestId,
      ...request,
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="mv-orders-empty">
        <div className="mv-orders-empty-card">
          <p className="mv-orders-empty-copy">Loading your latest activity…</p>
        </div>
      </div>
    );
  }

  if (visibleCards.length === 0) {
    return (
      <div className="mv-orders-empty">
        <div className="mv-orders-empty-card">
          <p className="mv-orders-empty-copy">
            No {activeType === "orders" ? "orders" : "service requests"} match the current filter.
          </p>
          <p className="mv-orders-empty-copy" style={{ marginTop: "1rem", color: "#475569" }}>
            Try a different status or switch tabs to refresh the list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      className="mv-orders-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mv-orders-header">
        <div>
          <p className="mv-eyebrow">Activity</p>
          <h1 className="mv-orders-title">Orders & Service Dashboard</h1>
          <p className="mv-orders-subtitle">
            Track every order and service request from one sleek dashboard.
          </p>
        </div>

        <div className="mv-orders-controls">
          <div className="mv-orders-tabs">
            {[
              { id: "orders", label: "Product Orders" },
              { id: "service", label: "Service Requests" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`mv-orders-tab ${
                  activeType === tab.id ? "mv-orders-tab--active" : ""
                }`}
                onClick={() => setActiveType(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mv-orders-filters">
            {[
              { id: "all", label: "All" },
              { id: "paid", label: "Paid" },
              { id: "payment-pending", label: "Payment Pending" },
              { id: "in-progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
              { id: "failed", label: "Failed" },
              { id: "returned", label: "Returned" },
              { id: "refund-processing", label: "Refund Processing" },
              { id: "refunded", label: "Refunded" },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`mv-orders-filter ${
                  statusFilter === filter.id ? "mv-orders-filter--active" : ""
                }`}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mv-orders-grid">
        {visibleCards.map((item) => {
          const statusLabel = getStatus(item);
          const statusClass = getStatusClass(statusLabel);
          const isOrder = item._type === "order";
          const canRetry = isOrder && ["payment pending", "failed"].includes(statusLabel.toLowerCase());
          const canCancel = isOrder && statusLabel.toLowerCase() === "paid";
          const orderNumber = item.orderId || item._id || item._uid || "—";
          const createdAt = item.createdAt || item.created_on || item.createdAt;
          const firstItem = Array.isArray(item.items) ? item.items[0] : null;
          const busy = cancelLoadingId === `${item._type}_${item._uid}`;

          return (
            <motion.article
              key={item._uid}
              className="mv-orders-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mv-orders-card-header">
                <div className="mv-orders-card-type">
                  {isOrder ? (
                    <>
                      <FiPackage /> <span>Order</span>
                    </>
                  ) : (
                    <>
                      <FiTool /> <span>Service</span>
                    </>
                  )}
                </div>
                <span className={`mv-orders-card-status ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="mv-orders-card-body">
                <div className="mv-orders-row">
                  <div className="mv-orders-item">
                    <span>Reference</span>
                    <strong>{orderNumber}</strong>
                  </div>
                  <div className="mv-orders-item">
                    <span>Date</span>
                    <strong>{formatDateTime(createdAt)}</strong>
                  </div>
                </div>

                <div className="mv-orders-row">
                  <div className="mv-orders-item">
                    <span>Customer</span>
                    <strong>{item.name || user.name || user.email}</strong>
                  </div>
                  <div className="mv-orders-item">
                    <span>Contact</span>
                    <strong>{item.phone || item.mobile || "-"}</strong>
                  </div>
                </div>

                {isOrder ? (
                  <>
                    <div className="mv-orders-row">
                      <div className="mv-orders-item">
                        <span>Delivery</span>
                        <strong>
                          {item.address ? (
                            <>
                              {item.address}
                              <br />
                              {item.city}, {item.pincode}
                            </>
                          ) : (
                            "Address unavailable"
                          )}
                        </strong>
                      </div>
                      <div className="mv-orders-item">
                        <span>Total</span>
                        <strong>₹{formatINR(item.total || item.grandTotal || item.amount)}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mv-orders-row">
                      <div className="mv-orders-item">
                        <span>Service</span>
                        <strong>{item.serviceType || item.subject || "Repair request"}</strong>
                      </div>
                      <div className="mv-orders-item">
                        <span>Device</span>
                        <strong>{item.device || firstItem?.name || "Mobile device"}</strong>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mv-orders-actions">
                <Link to="/orders" className="mv-btn-secondary">
                  Details <FiArrowRight size={16} />
                </Link>
                {canRetry && (
                  <button
                    type="button"
                    className="mv-btn-primary"
                    onClick={() => retryPayment(item._uid)}
                  >
                    Retry payment
                  </button>
                )}
                {canCancel && (
                  <button
                    type="button"
                    className="mv-btn-secondary"
                    disabled={busy}
                    onClick={() => handleCancel(item)}
                  >
                    {busy ? "Cancelling…" : "Cancel order"}
                  </button>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}
