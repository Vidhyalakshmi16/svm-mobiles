// src/pages/AdminServiceRequestsPage.js
import React, { useEffect, useState } from "react";
import {
  getServiceRequests,
  updateServiceRequestStatus,
} from "../services/api";
import {
  FiSmartphone,
  FiMapPin,
  FiPhone,
  FiClock,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const STATUS_OPTIONS = [
  { value: "Placed", label: "Placed" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

// 🔁 Normalise whatever comes from DB
const normalizeStatus = (status) => {
  if (!status) return "Placed";
  if (status === "New") return "Placed"; // old records
  const allowed = ["Placed", "In Progress", "Completed", "Cancelled"];
  return allowed.includes(status) ? status : "Placed";
};

const statusBadgeClass = (status) => {
  switch (status) {
    case "Completed":
      return "badge bg-success-subtle text-success border border-success-subtle";
    case "Cancelled":
      return "badge bg-danger-subtle text-danger border border-danger-subtle";
    case "In Progress":
      return "badge bg-warning-subtle text-warning border border-warning-subtle";
    default:
      return "badge bg-secondary-subtle text-secondary border border-secondary-subtle";
  }
};

const AdminServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // pagination
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getServiceRequests();
        setRequests(data || []);
      } catch (err) {
        console.error("Failed to load service requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (!newStatus) return;
    setUpdatingId(id);

    try {
      const updated = await updateServiceRequestStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? updated : req))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return "-";
    return new Date(dt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ------- filtering -------
  const filteredRequests = (requests || []).filter((req) => {
    const st = normalizeStatus(req.status);
    if (statusFilter === "all") return true;
    return st === statusFilter;
  });

  // ------- pagination logic -------
  const total = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSlice = filteredRequests.slice(
    startIndex,
    startIndex + pageSize
  );
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = startIndex + currentSlice.length;

  // reset page when filter / size changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, pageSize]);

  return (
    <div className="admin-page">
      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Service Requests</h4>
          <small className="text-muted">
            Manage all repair / service bookings from customers.
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* status filter */}
          <select
            className="form-select form-select-sm"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="Placed">Placed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* page size */}
          <select
            className="form-select form-select-sm"
            style={{ width: 110 }}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>

          {/* info + arrows */}
          <div className="d-flex align-items-center gap-2 small text-muted">
            <span>
              Showing {showingFrom}-{showingTo} of {total}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-circle p-1"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <FiChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-circle p-1"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted small mt-4">Loading service requests…</div>
      ) : total === 0 ? (
        <div className="text-muted small mt-4">
          No service requests to show.
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-4 bg-white">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer</th>
                <th>Device / Issue</th>
                <th>Contact & Address</th>
                <th>Preferred Slot</th>
                <th>Status</th>
                <th style={{ width: 160 }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {currentSlice.map((req) => {
                const normStatus = normalizeStatus(req.status);

                return (
                  <tr key={req._id}>
                    {/* Customer */}
                    <td>
                      <div className="fw-semibold small">
                        {req.name || "—"}
                      </div>
                      {req.email && (
                        <div className="small text-muted d-flex align-items-center gap-1">
                          <FiMail size={12} />
                          <span>{req.email}</span>
                        </div>
                      )}
                      <div className="small text-muted">
                        #{String(req._id).slice(-7)}
                      </div>
                    </td>

                    {/* Device / Issue */}
                    <td>
                      <div className="small d-flex align-items-center gap-1 fw-semibold">
                        <FiSmartphone size={14} />
                        <span>
                          {req.deviceBrand || "Device"}{" "}
                          {req.deviceModel ? `• ${req.deviceModel}` : ""}
                        </span>
                      </div>
                      {req.issueType && (
                        <div className="small text-muted mt-1">
                          Issue: {req.issueType}
                        </div>
                      )}
                      {req.message && (
                        <div
                          className="small text-muted mt-1"
                          style={{
                            maxWidth: 260,
                            maxHeight: 40,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={req.message}
                        >
                          “{req.message}”
                        </div>
                      )}
                    </td>

                    {/* Contact & Address */}
                    <td>
                      <div className="small text-muted d-flex align-items-center gap-1 mb-1">
                        <FiPhone size={12} />
                        <span>{req.phone || "—"}</span>
                      </div>
                      {req.address && (
                        <div className="small text-muted d-flex align-items-start gap-1">
                          <FiMapPin size={12} className="mt-1" />
                          <span>{req.address}</span>
                        </div>
                      )}
                    </td>

                    {/* Preferred Slot */}
                    <td className="small text-muted">
                      {req.preferredDate || req.createdAt ? (
                        <>
                          {req.preferredDate && (
                            <div className="d-flex align-items-center gap-1 mb-1">
                              <FiClock size={12} />
                              <span>{req.preferredDate}</span>
                            </div>
                          )}
                          {req.preferredTime && (
                            <div className="ms-3 mb-1">
                              {req.preferredTime}
                            </div>
                          )}
                          <div className="text-muted">
                            Created: {formatDateTime(req.createdAt)}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={statusBadgeClass(normStatus)}>
                        {normStatus}
                      </span>
                    </td>

                    {/* Update dropdown */}
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={normStatus}
                        disabled={updatingId === req._id}
                        onChange={(e) =>
                          handleStatusChange(req._id, e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .admin-page {
          padding-bottom: 24px;
        }
        .table > :not(caption) > * > * {
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default AdminServiceRequestsPage;
