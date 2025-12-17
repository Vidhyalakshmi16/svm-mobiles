// src/pages/AdminOrdersPage.js
import React, { useEffect, useState } from "react";
import { getOrdersApi, updateOrderStatusApi } from "../services/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // pagination size

  // ------------------------------
  // Load all orders
  // ------------------------------
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrdersApi();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  // Format ₹
  const formatINR = (num = 0) =>
    Number(num).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // ------------------------------
  // Confirm popup for cancelling
  // ------------------------------
  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    // CONFIRM CANCEL
    if (newStatus === "Cancelled") {
      const ok = window.confirm(
        "Are you sure you want to cancel this order? This cannot be undone."
      );
      if (!ok) return;
    }

    // UPDATE STATUS
    try {
      const updated = await updateOrderStatusApi(orderId, newStatus);

      // Update state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );

      // Auto-refresh after update
      await fetchOrders();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  // ------------------------------
  // Filters
  // ------------------------------
  const filteredOrders = orders.filter((o) => {
    const q = search.trim().toLowerCase();

    const matchesSearch =
      !q ||
      o._id?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.toLowerCase().includes(q);

    const status = (o.status || "Placed").toLowerCase();
    const matchesStatus =
      statusFilter === "all" || status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // ------------------------------
  // Pagination
  // ------------------------------
  const totalPages =
    filteredOrders.length === 0
      ? 1
      : Math.ceil(filteredOrders.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePrev = () =>
    setCurrentPage((p) => (p > 1 ? p - 1 : p));

  const handleNext = () =>
    setCurrentPage((p) => (p < totalPages ? p + 1 : p));

  // ------------------------------
  // Status pill colors
  // ------------------------------
  const statusBadgeClass = (status) => {
    const s = (status || "Placed").toLowerCase();
    if (s === "completed") return "badge bg-success-subtle text-success";
    if (s === "cancelled") return "badge bg-danger-subtle text-danger";
    if (s === "in progress") return "badge bg-warning-subtle text-warning";
    return "badge bg-primary-subtle text-primary"; // Placed
  };

  // ------------------------------
  // UI
  // ------------------------------

  return (
    <div className="adm-page">
      <div className="adm-inner">

        {/* HEADER */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <h3 className="fw-bold mb-1">Admin · Orders</h3>
            <small className="text-muted">
              {filteredOrders.length} order(s) matched
            </small>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ minWidth: 230 }}
              placeholder="Search by name / phone / id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Status filter */}
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={fetchOrders}
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center mt-4">
            <div className="spinner-border spinner-border-sm me-2" />
            Loading…
          </div>
        ) : (
          <>
            {/* GRID */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
              {paginatedOrders.map((order) => {
                const createdAt = order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-";

                const itemsCount =
                  order.items?.reduce(
                    (sum, it) => sum + (it.quantity || 0),
                    0
                  ) || 0;

                return (
                  <div className="col" key={order._id}>
                    <div className="card h-100 border-0 shadow-sm rounded-4">
                      <div className="card-body d-flex flex-column">

                        {/* Top row */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="text-muted small">Order ID</div>
                            <div className="fw-semibold">
                              #{String(order._id).slice(-8)}
                            </div>
                            <div className="text-muted small">{createdAt}</div>
                          </div>

                          <div className="text-end">
                            {/* STATUS DROPDOWN */}
                            <select
                              className="form-select form-select-sm mb-1"
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                            >
                              <option value="Placed">Placed</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>

                            {/* STATUS PILL */}
                            <span
                              className={`${statusBadgeClass(order.status)} mb-1`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {order.status}
                            </span>

                            <div className="small text-muted mt-1">
                              Items: {itemsCount}
                            </div>
                          </div>
                        </div>

                        {/* Middle: payment + total */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <div className="small text-muted">Total</div>
                            <div className="fw-bold">
                              ₹{formatINR(order.total)}
                            </div>
                          </div>
                          <div className="text-end small text-muted">
                            <div className="fw-semibold text-dark">Payment</div>
                            <div>{order.paymentMethod}</div>
                          </div>
                        </div>

                        <hr className="my-2" />

                        {/* Customer info */}
                        <div className="small text-muted mb-2">
                          <div className="fw-semibold text-dark mb-1">
                            Customer
                          </div>
                          <div>{order.customer?.name}</div>
                          <div>Phone: {order.customer?.phone}</div>
                          <div className="text-truncate">
                            {order.customer?.address},{" "}
                            {order.customer?.city} - {order.customer?.pincode}
                          </div>
                        </div>

                        {/* Items preview */}
                        {order.items?.length > 0 && (
                          <div className="mt-auto pt-2 border-top small">
                            <div className="fw-semibold text-dark mb-1">
                              Items
                            </div>

                            {order.items.slice(0, 2).map((item, idx) => (
                              <div
                                key={idx}
                                className="d-flex justify-content-between align-items-center mb-1"
                              >
                                <div className="d-flex align-items-center gap-2">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        objectFit: "cover",
                                        borderRadius: 6,
                                      }}
                                    />
                                  )}
                                  <span className="text-truncate">
                                    {item.name}
                                  </span>
                                </div>

                                <span>
                                  ×{item.quantity} · ₹{formatINR(item.price)}
                                </span>
                              </div>
                            ))}

                            {order.items.length > 2 && (
                              <div className="text-muted">
                                + {order.items.length - 2} more item(s)
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Showing {startIndex + 1}–
                {Math.min(startIndex + pageSize, filteredOrders.length)} of{" "}
                {filteredOrders.length}
              </small>

              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={handlePrev}>
                    Previous
                  </button>
                </li>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <li
                    key={idx}
                    className={`page-item ${
                      currentPage === idx + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button className="page-link" onClick={handleNext}>
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
