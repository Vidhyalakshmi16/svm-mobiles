import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMyOrdersApi,
  getMyServiceRequests,
  cancelOrder,
  retryPaymentApi,
  verifyPaymentApi,
} from "../services/api";
import {
  FiPackage,
  FiTool,
  FiClock,
  FiChevronDown,
  FiMapPin,
  FiShoppingBag,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

const ORDER_FILTERS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "payment-pending", label: "Pending" },
  { id: "in-progress", label: "Processing" },
  { id: "completed", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "failed", label: "Failed" },
  { id: "refund-processing", label: "Refunding" },
  { id: "refunded", label: "Refunded" },
];

const SERVICE_FILTERS = [
  { id: "all", label: "All" },
  { id: "in-progress", label: "Active" },
  { id: "completed", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
];

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
  return `orders-status orders-status--${slug}`;
};

const shortId = (id) => {
  if (!id) return "—";
  const s = String(id);
  return s.length > 8 ? `#${s.slice(-8).toUpperCase()}` : `#${s}`;
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [activeType, setActiveType] = useState("orders");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, serviceRes] = await Promise.all([
          getMyOrdersApi(),
          getMyServiceRequests(),
        ]);

        setOrders(Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || []);

        const serviceData = serviceRes?.data ?? serviceRes;
        setServiceRequests(
          Array.isArray(serviceData) ? serviceData : serviceData?.request || []
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
    Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const formatDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const combined = useMemo(
    () =>
      [
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
          new Date(a.createdAt || b.created_on || 0)
      ),
    [orders, serviceRequests]
  );

  const orderCount = orders.length;
  const serviceCount = serviceRequests.length;

  const activeFilters = activeType === "orders" ? ORDER_FILTERS : SERVICE_FILTERS;

  const visibleCards = useMemo(() => {
    return combined.filter((item) => {
      if (activeType === "orders" && item._type !== "order") return false;
      if (activeType === "service" && item._type !== "service") return false;
      if (statusFilter === "all") return true;
      const slug = getStatus(item).toLowerCase().replace(/\s+/g, "-");
      return slug === statusFilter;
    });
  }, [combined, activeType, statusFilter]);

  const activeCount = useMemo(
    () =>
      combined.filter((item) => {
        const s = getStatus(item).toLowerCase();
        return ["paid", "in progress", "payment pending"].includes(s);
      }).length,
    [combined]
  );

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
          if (result) window.location.reload();
          else alert("Payment verification failed");
        },
        theme: { color: "#4f46e5" },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      alert(error.response?.data?.message || "Retry failed");
    }
  };

  const handleCancel = async (item) => {
    if (item._type !== "order") return;
    if (getStatus(item).toLowerCase() !== "paid") return;
    if (!window.confirm("Cancel this order? A refund will be processed if applicable.")) return;

    const key = `${item._type}_${item._uid}`;
    setCancelLoadingId(key);

    try {
      await cancelOrder(item._uid);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === item._uid ? { ...o, status: "REFUND_PROCESSING" } : o
        )
      );
    } catch (error) {
      console.error("Cancel order failed:", error);
      alert("Could not cancel order. Please try again.");
    } finally {
      setCancelLoadingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <section className="orders-page">
      <div className="orders-container">
        <header className="orders-hero">
          <span className="orders-eyebrow">My account</span>
          <h1 className="orders-title">Orders & repairs</h1>
          <p className="orders-lead">
            Track purchases and service requests in one place. Tap a card to see full details.
          </p>
        </header>

        {!loading && (
          <div className="orders-summary">
            <div className="orders-summary-card">
              <div className="orders-summary-label">Total orders</div>
              <div className="orders-summary-value">{orderCount}</div>
            </div>
            <div className="orders-summary-card">
              <div className="orders-summary-label">Service requests</div>
              <div className="orders-summary-value">{serviceCount}</div>
            </div>
            <div className="orders-summary-card">
              <div className="orders-summary-label">Active</div>
              <div className="orders-summary-value">{activeCount}</div>
            </div>
          </div>
        )}

        <div className="orders-toolbar">
          <div className="orders-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeType === "orders"}
              className={`orders-tab ${activeType === "orders" ? "orders-tab--active" : ""}`}
              onClick={() => {
                setActiveType("orders");
                setStatusFilter("all");
                setExpandedId(null);
              }}
            >
              <FiPackage size={18} />
              Orders
              <span className="orders-tab-count">{orderCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeType === "service"}
              className={`orders-tab ${activeType === "service" ? "orders-tab--active" : ""}`}
              onClick={() => {
                setActiveType("service");
                setStatusFilter("all");
                setExpandedId(null);
              }}
            >
              <FiTool size={18} />
              Repairs
              <span className="orders-tab-count">{serviceCount}</span>
            </button>
          </div>

          <span className="orders-filter-label">Filter by status</span>
          <div className="orders-filters">
            {activeFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`orders-filter-chip ${
                  statusFilter === filter.id ? "orders-filter-chip--active" : ""
                }`}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="orders-list">
            {[1, 2, 3].map((n) => (
              <div key={n} className="orders-skeleton" aria-hidden="true" />
            ))}
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="orders-state">
            <div className="orders-state-icon">
              {activeType === "orders" ? <FiPackage /> : <FiTool />}
            </div>
            <h2>
              No {activeType === "orders" ? "orders" : "service requests"} found
            </h2>
            <p>
              {statusFilter !== "all"
                ? "Try a different filter or view all items."
                : activeType === "orders"
                ? "When you buy something, it will show up here."
                : "Submit a repair request from the Services page."}
            </p>
            <Link to={activeType === "orders" ? "/products" : "/services"} className="orders-btn orders-btn--primary">
              <FiShoppingBag size={16} />
              {activeType === "orders" ? "Browse products" : "Book a service"}
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            <AnimatePresence initial={false}>
              {visibleCards.map((item) => {
                const statusLabel = getStatus(item);
                const isOrder = item._type === "order";
                const cardKey = `${item._type}_${item._uid}`;
                const isOpen = expandedId === cardKey;
                const canRetry =
                  isOrder &&
                  ["payment pending", "failed"].includes(statusLabel.toLowerCase());
                const canCancel = isOrder && statusLabel.toLowerCase() === "paid";
                const busy = cancelLoadingId === cardKey;
                const createdAt = item.createdAt || item.created_on;
                const firstItem = Array.isArray(item.items) ? item.items[0] : null;
                const thumb =
                  firstItem?.image ||
                  item.image ||
                  (isOrder ? null : null);
                const title = isOrder
                  ? firstItem?.name
                    ? `${firstItem.name}${item.items?.length > 1 ? ` +${item.items.length - 1} more` : ""}`
                    : "Product order"
                  : item.serviceType || item.subject || "Service request";
                const customer = item.customer || {};
                const address =
                  item.address || customer.address
                    ? `${item.address || customer.address || ""}${
                        item.city || customer.city
                          ? `, ${item.city || customer.city}`
                          : ""
                      }${item.pincode || customer.pincode ? ` ${item.pincode || customer.pincode}` : ""}`
                    : null;

                return (
                  <motion.article
                    key={cardKey}
                    className="orders-card"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className="orders-card-main"
                      onClick={() => toggleExpand(cardKey)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(cardKey);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                    >
                      {thumb ? (
                        <img src={thumb} alt="" className="orders-card-thumb" />
                      ) : (
                        <div className="orders-card-thumb orders-card-thumb--placeholder">
                          {isOrder ? <FiPackage /> : <FiTool />}
                        </div>
                      )}

                      <div className="orders-card-info">
                        <div className="orders-card-top">
                          <span className="orders-card-type">
                            {isOrder ? "Order" : "Service"}
                          </span>
                          <span className="orders-card-ref">{shortId(item._uid)}</span>
                        </div>
                        <h2 className="orders-card-name">{title}</h2>
                        <div className="orders-card-meta">
                          <span>
                            <FiClock size={14} />
                            {formatDateTime(createdAt)}
                          </span>
                          {isOrder && address && (
                            <span>
                              <FiMapPin size={14} />
                              {item.city || customer.city || "Delivery"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="orders-card-side">
                        {isOrder && (
                          <div className="orders-card-total">
                            ₹{formatINR(item.total || item.grandTotal)}
                          </div>
                        )}
                        <span className={getStatusClass(statusLabel)}>{statusLabel}</span>
                        <FiChevronDown
                          size={20}
                          className={`orders-card-chevron ${isOpen ? "orders-card-chevron--open" : ""}`}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          className="orders-card-details"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="orders-detail-grid">
                            <div className="orders-detail-block">
                              <span>Customer</span>
                              <strong>
                                {customer.name || item.name || user.name || "—"}
                              </strong>
                            </div>
                            <div className="orders-detail-block">
                              <span>Phone</span>
                              <strong>
                                {customer.phone || item.phone || item.mobile || "—"}
                              </strong>
                            </div>
                            {isOrder && address && (
                              <div className="orders-detail-block" style={{ gridColumn: "1 / -1" }}>
                                <span>Delivery address</span>
                                <strong>{address}</strong>
                              </div>
                            )}
                            {!isOrder && (
                              <>
                                <div className="orders-detail-block">
                                  <span>Device</span>
                                  <strong>
                                    {item.device || item.phoneModel || "—"}
                                  </strong>
                                </div>
                                <div className="orders-detail-block">
                                  <span>Issue</span>
                                  <strong>
                                    {item.issue || item.message || item.description || "—"}
                                  </strong>
                                </div>
                              </>
                            )}
                          </div>

                          {isOrder && Array.isArray(item.items) && item.items.length > 0 && (
                            <ul className="orders-line-items">
                              {item.items.map((line, idx) => (
                                <li key={idx} className="orders-line-item">
                                  <span>
                                    {line.productId ? (
                                      <Link
                                        to={`/product/${line.productId}`}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {line.name}
                                      </Link>
                                    ) : (
                                      line.name
                                    )}{" "}
                                    × {line.quantity || 1}
                                  </span>
                                  <strong>
                                    ₹{formatINR((line.finalPrice ?? line.price) * (line.quantity || 1))}
                                  </strong>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div
                            className="orders-card-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {canRetry && (
                              <button
                                type="button"
                                className="orders-btn orders-btn--primary"
                                onClick={() => retryPayment(item._uid)}
                              >
                                Pay now
                              </button>
                            )}
                            {canCancel && (
                              <button
                                type="button"
                                className="orders-btn orders-btn--danger"
                                disabled={busy}
                                onClick={() => handleCancel(item)}
                              >
                                {busy ? "Cancelling…" : "Cancel order"}
                              </button>
                            )}
                            {isOrder && item.status === "COMPLETED" && (
                              <Link
                                to={`/return/${item._uid}`}
                                className="orders-btn orders-btn--outline"
                              >
                                Request return
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
