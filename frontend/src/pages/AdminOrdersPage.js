import React, { useEffect, useState } from "react";
import { getOrdersApi, updateOrderStatusApi } from "../services/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // ------------------------------
  // Load Orders
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

  // ------------------------------
  // Helpers
  // ------------------------------
  const formatINR = (num = 0) =>
    Number(num).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // ------------------------------
  // Update Status
  // ------------------------------
  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    if (newStatus === "CANCELLED") {
      const ok = window.confirm("Cancel this order?");
      if (!ok) return;
    }

    try {
      const updated = await updateOrderStatusApi(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );
    } catch (err) {
      alert("Status update failed");
    }
  };

  // ------------------------------
  // Filters
  // ------------------------------
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase().trim();

    const matchesSearch =
      !q ||
      o._id?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.toLowerCase().includes(q);

    const status = (o.status || "").toLowerCase();
    const matchesStatus =
      statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ------------------------------
  // Pagination
  // ------------------------------
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + pageSize
  );

  // ------------------------------
  // Status badge color
  // ------------------------------
  const statusBadgeClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "badge bg-success";
      case "CANCELLED":
      case "FAILED":
        return "badge bg-danger";
      case "RETURNED":
        return "badge bg-warning text-dark";
      case "REFUND_PROCESSING":
        return "badge bg-info";
      case "REFUNDED":
        return "badge bg-success";
      case "PAID":
        return "badge bg-primary";
      case "IN_PROGRESS":
        return "badge bg-warning text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-3">Admin · Orders</h3>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control form-control-sm"
          placeholder="Search by name / phone / order id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select form-select-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="payment_pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
          <option value="refund_processing">Refund Processing</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>

        <button className="btn btn-sm btn-outline-secondary" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="text-center py-5">Loading…</div>
      ) : (
        <div className="row g-3">
          {paginatedOrders.map((order) => (
            <div className="col-md-6 col-lg-4" key={order._id}>
              <div className="card shadow-sm rounded-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div className="small text-muted">Order</div>
                      <div className="fw-semibold">
                        #{order._id.slice(-8)}
                      </div>
                    </div>
                    <span className={statusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <div className="small text-muted mb-2">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </div>

                  <div className="mb-2">
                    <b>{order.customer?.name}</b>
                    <br />
                    {order.customer?.phone}
                  </div>

                  <div className="mb-2">
                    <b>Total:</b> ₹{formatINR(order.total)}
                  </div>

                  {/* Status Control */}
                  <select
                    className="form-select form-select-sm mb-2"
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                  >
                    <option value="PAYMENT_PENDING">Payment Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                    <option value="REFUND_PROCESSING">Refund Processing</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="FAILED">Failed</option>
                  </select>

                  {(order.status === "CANCELLED" ||
                    order.status === "RETURNED") && (
                    <button
                      className="btn btn-sm btn-danger w-100"
                      onClick={async () => {
                        const ok = window.confirm("Process refund?");
                        if (!ok) return;

                        try {
                          await fetch(
                            `${process.env.REACT_APP_API_URL}/orders/${order._id}/refund`,
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "token"
                                )}`,
                              },
                            }
                          );
                          alert("Refund processed");
                          fetchOrders();
                        } catch {
                          alert("Refund failed");
                        }
                      }}
                    >
                      Process Refund 
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
