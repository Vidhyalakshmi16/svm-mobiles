import React, { useEffect, useState } from "react";
import {
  getProducts,
  getOrdersApi,
  getServiceRequests,
} from "../services/api";
import {
  FiShoppingBag,
  FiTrendingUp,
  // FiClock,
  FiTool,
  FiPercent,
  FiUser,
  FiMapPin,
  FiPhone,
  FiSmartphone,
} from "react-icons/fi";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [p, o, s] = await Promise.all([
        getProducts(),
        getOrdersApi(),
        getServiceRequests(),
      ]);

      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);

      // IMPORTANT FIX
      const serviceList =
  s?.requests ||
  s?.serviceRequests ||
  s?.data ||
  (Array.isArray(s) ? s : []);

setServiceRequests(serviceList);


    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, []);

const liveProducts = products.filter(
  (p) => (p.stock ?? 0) > 0
);



  const formatINR = (num = 0) =>
    Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // ======= Derived metrics =======
  const successfulOrders = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Completed"
  );
  
  const pendingOrders = orders.filter(
    (o) => !o.status || o.status === "Placed" || o.status === "In Progress"
  );
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");

  const totalRevenue = successfulOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );
  const actualProfit = successfulOrders.reduce((totalProfit, order) => {
  let orderProfit = 0;

  order.items?.forEach((item) => {
    // Find product from products list
    const product = products.find(
      (p) =>
        p._id === item.product ||
        p._id === item.productId ||
        p._id === item._id
    );

    const sellingPrice = item.finalPrice ?? item.price ?? 0;
    const costPrice = product?.cost ?? 0;
    const quantity = item.quantity ?? 1;

    orderProfit += (sellingPrice - costPrice) * quantity;
  });

  return totalProfit + orderProfit;
}, 0);


  const totalOrders = orders.length;
  const totalServiceRequests = serviceRequests.length;
  const newServiceRequests = serviceRequests.filter(
    (r) => r.status === "Placed"
  ).length;

  // Orders by status counts
  const statusCounts = {
    Placed: orders.filter((o) => !o.status || o.status === "Placed").length,
    "In Progress": orders.filter((o) => o.status === "In Progress").length,
    Delivered: orders.filter((o) => o.status === "Delivered").length,
    Cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };

  // Top discounted products
  const discountedProducts = [...products]
    .filter((p) => p.discount && p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 5);

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  // Recent service requests (last 5)
  const recentService = [...serviceRequests]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  // ======= Chart data =======

  // Daily revenue & orders (for line chart)
  const dailyMap = {};
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const d = new Date(o.createdAt);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!dailyMap[key]) {
      dailyMap[key] = {
        dateLabel: d.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        revenue: 0,
        ordersCount: 0,
      };
    }
    dailyMap[key].ordersCount += 1;
    if (o.status === "Delivered" || o.status === "Completed") {
      dailyMap[key].revenue += o.total || 0;
    }
  });

  const dailyStats = Object.keys(dailyMap)
    .sort()
    .map((k) => dailyMap[k]);

  // Pie chart data
  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  const PIE_COLORS = ["#0f172a", "#fbbf24", "#22c55e", "#ef4444"];

  return (
    <div className="adm-page">
      <div className="adm-inner">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="adm-title mb-1">Admin Overview</h1>
            <small className="text-muted">
              High-level snapshot of sales, orders & service activity
            </small>
          </div>
          <div className="adm-header-right d-none d-md-flex">
            <div className="d-flex align-items-center gap-2 small text-muted">
              <span className="dot-online" /> Live data
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-muted">Loading dashboard...</p>
        ) : (
          <>
            {/* Summary cards */}
            <div className="adm-summaries mb-4">
              <div className="adm-card kpi-card">
                <div>
                  <div className="card-title">Total Revenue</div>
                  <div className="card-value">₹{formatINR(totalRevenue)}</div>
                  <div className="small text-muted mt-1">
                    From delivered / completed orders
                  </div>
                </div>
                <div className="dash-icon-wrap">
                  <FiTrendingUp size={22} />
                </div>
              </div>

              <div className="adm-card kpi-card">
                <div>
                  <div className="card-title">Total Orders</div>
                  <div className="card-value">{totalOrders}</div>
                  <div className="small text-muted mt-1">
                    {pendingOrders.length} active • {cancelledOrders.length}{" "}
                    cancelled
                  </div>
                </div>
                <div className="dash-icon-wrap">
                  <FiShoppingBag size={22} />
                </div>
              </div>

              <div className="adm-card kpi-card">
                <div>
                  <div className="card-title">Service Requests</div>
                  <div className="card-value">{totalServiceRequests}</div>
                  <div className="small text-muted mt-1">
                    {newServiceRequests} new waiting
                  </div>
                </div>
                <div className="dash-icon-wrap">
                  <FiTool size={22} />
                </div>
              </div>

              <div className="adm-card kpi-card">
                <div>
                  <div className="card-title">Products Live</div>
                  <div className="card-value">{liveProducts.length}</div>
                  <div className="small text-muted mt-1">
                    {discountedProducts.length} with discounts
                  </div>
                </div>
                <div className="dash-icon-wrap">
                  <FiPercent size={22} />
                </div>
              </div>

              <div className="adm-card d-flex justify-content-between align-items-center kpi-card">
                <div>
                  <div className="card-title">Actual Profit</div>
                  <div className="card-value">
                    ₹{formatINR(actualProfit)}
                  </div>
                  <div className="small text-muted mt-1">
                    Calculated from product cost vs selling price
                  </div>
                </div>
                <div className="dash-icon-wrap">
                  <FiTrendingUp size={22} />
                </div>
              </div>

            </div>

            {/* Charts row – SQUARE CARDS */}
<div className="charts-row charts-row-square mb-4">
  {/* Line Chart: Revenue & Orders */}
  <div className="chart-card chart-square">
    <div className="chart-header">
      <h3 className="mb-1">Revenue &amp; Orders</h3>
      <small className="text-muted">
        Trend of revenue vs number of orders
      </small>
    </div>

    {dailyStats.length === 0 ? (
      <p className="small text-muted mb-0 mt-3">
        Not enough data to show trend yet.
      </p>
    ) : (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dailyStats}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => `₹${formatINR(v)}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
              formatter={(value, name) =>
                name === "Revenue"
                  ? `₹${formatINR(value)}`
                  : `${value} orders`
              }
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#111827"
              strokeWidth={2.4}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ordersCount"
              name="Orders"
              stroke="#f59e0b"
              strokeWidth={2.4}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>

  {/* Pie Chart: Order status */}
  <div className="chart-card chart-square">
    <div className="chart-header">
      <h3 className="mb-1">Order Status Breakdown</h3>
      <small className="text-muted">
        Delivered vs pending vs cancelled
      </small>
    </div>

    {pieData.length === 0 ? (
      <p className="small text-muted mb-0 mt-3">
        No orders to display status chart.
      </p>
    ) : (
      <div className="chart-wrapper d-flex align-items-center gap-3">
        <ResponsiveContainer width="55%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="88%"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-grow-1">
          {pieData.map((item, idx) => (
            <div
              key={item.name}
              className="d-flex justify-content-between align-items-center mb-2 small"
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  className="legend-dot"
                  style={{
                    background: PIE_COLORS[idx % PIE_COLORS.length],
                  }}
                />
                <span>{item.name}</span>
              </div>
              <span className="text-muted">
                {item.value} orders
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* Top Discounts – scrollable */}
  <div className="chart-card chart-square chart-discount">
    <h3 className="mb-1">Top Discounts</h3>
    <div className="small text-muted mb-1">
      Products with highest current discount
    </div>

    <div className="discount-list">
      {discountedProducts.length === 0 ? (
        <p className="small text-muted mb-0">
          No discounts applied yet.
        </p>
      ) : (
        <ul className="list-unstyled mb-0">
          {discountedProducts.map((p) => (
            <li
              key={p._id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <div className="d-flex flex-column">
                <span className="small fw-semibold">
                  {p.name}
                </span>
                <span className="small text-muted">
                  {p.brand} • ₹
                  {formatINR(p.finalPrice ?? p.price)}
                </span>
              </div>
              <span className="badge rounded-pill discount-pill">
                {p.discount}% OFF
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div>


            {/* Bottom row: Recent orders + Service */}
            <div className="charts-row">
              {/* Recent Orders */}
              <div className="chart-card">
                <h3 className="mb-2">Recent Orders</h3>
                {recentOrders.length === 0 ? (
                  <p className="small text-muted mb-0">No orders yet.</p>
                ) : (
                  <div
                    style={{ maxHeight: 260, overflowY: "auto" }}
                    className="pe-1"
                  >
                    {recentOrders.map((o) => (
                      <div
                        key={o._id}
                        className="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom"
                        style={{ borderColor: "#eef2f7" }}
                      >
                        <div>
                          <div className="small fw-semibold">
                            #{String(o._id).slice(-8)}
                          </div>
                          <div className="small text-muted">
                            {o.customer?.name}
                          </div>
                          <div className="tiny-muted">
                            {o.createdAt &&
                              new Date(o.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="small fw-semibold text-success">
                            ₹{formatINR(o.total)}
                          </div>
                          <span
                            className={`tiny-pill tiny-${(
                              o.status || "Placed"
                            )
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {o.status || "Placed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Service Requests */}
              <div className="chart-card">
                <h3 className="mb-2">Recent Service Requests</h3>
                {recentService.length === 0 ? (
                  <p className="small text-muted mb-0">
                    No service requests yet.
                  </p>
                ) : (
                  <div
                    style={{ maxHeight: 260, overflowY: "auto" }}
                    className="pe-1"
                  >
                    {recentService.map((r) => (
                      <div
                        key={r._id}
                        className="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom"
                        style={{ borderColor: "#eef2f7" }}
                      >
                        <div>
                          <div className="small fw-semibold d-flex align-items-center gap-1">
                            <FiUser size={12} />
                            <span>{r.name}</span>
                          </div>
                          <div className="tiny-muted d-flex align-items-center gap-1">
                            <FiPhone size={11} /> <span>{r.phone}</span>
                          </div>
                          {r.deviceBrand && (
                            <div className="tiny-muted d-flex align-items-center gap-1">
                              <FiSmartphone size={11} />{" "}
                              <span>
                                {r.deviceBrand}
                                {r.deviceModel ? ` • ${r.deviceModel}` : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-end">
                          <div className="tiny-muted d-flex align-items-center gap-1 justify-content-end">
                            <FiMapPin size={11} />
                            <span>
                              {r.city || ""}
                              {r.pincode ? ` • ${r.pincode}` : ""}
                            </span>
                          </div>
                          <span className="tiny-pill tiny-service">
                            {r.status || "New"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Local styles specific for dashboard */}
      <style>{`
        .adm-page {
          background:#f3f4f6;
          min-height:100vh;
          padding:24px;
        }
        .adm-inner {
          max-width:1200px;
          margin:0 auto;
        }
        .adm-title {
          font-size:24px;
          font-weight:700;
          color:#111827;
        }

        .adm-summaries {
          display:grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap:18px;
        }

        .adm-card {
          background:#ffffff;
          border-radius:18px;
          padding:16px 18px;
          box-shadow:0 10px 30px rgba(15,23,42,0.08);
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
        }
        .kpi-card {
          position:relative;
          overflow:hidden;
        }
        .kpi-card::before {
          content:"";
          position:absolute;
          inset:0;
          background:radial-gradient(circle at top right, rgba(17,24,39,0.06), transparent 55%);
          pointer-events:none;
        }

        .card-title {
          font-size:13px;
          text-transform:uppercase;
          letter-spacing:0.08em;
          color:#6b7280;
          margin-bottom:4px;
        }
        .card-value {
          font-size:22px;
          font-weight:700;
          color:#111827;
        }

        .dash-icon-wrap {
          width:40px;
          height:40px;
          border-radius:999px;
          display:flex;
          align-items:center;
          justify-content:center;
          background: #111827;
          color:#f9fafb;
          box-shadow: 0 6px 18px rgba(15,23,42,0.25);
          flex-shrink:0;
        }

        .charts-row {
          display:grid;
          grid-template-columns:2fr 1.6fr 1.4fr;
          gap:18px;
        }

        /* NEW: square layout for the top 3 cards */
.charts-row-square {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* make each chart card look like a square */
.chart-square {
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
}

/* chart area fills remaining space nicely */
.chart-square .chart-wrapper {
  flex: 1;
  min-height: 0;
}

/* Top discounts scroll area */
.chart-discount .discount-list {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

/* optional: softer scrollbar look */
.chart-discount .discount-list::-webkit-scrollbar {
  width: 6px;
}
.chart-discount .discount-list::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 999px;
}
.chart-discount .discount-list::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 999px;
}

/* keep responsiveness */
@media (max-width: 1200px) {
  .charts-row-square {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 992px) {
  .charts-row,
  .charts-row-square {
    grid-template-columns: 1fr !important;
  }
}

        .chart-card {
          background:#ffffff;
          border-radius:18px;
          padding:16px 18px;
          box-shadow:0 10px 30px rgba(15,23,42,0.06);
        }
        .chart-header h3 {
          font-size:16px;
          font-weight:600;
          color:#111827;
        }
        .chart-wrapper {
          margin-top:10px;
        }

        .discount-pill {
          background:#111827;
          color:#f9fafb;
          font-size:11px;
          padding-inline:10px;
          box-shadow:0 4px 12px rgba(15,23,42,0.25);
        }

        .tiny-pill {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:2px 8px;
          border-radius:999px;
          font-size:10px;
          font-weight:600;
        }
        .tiny-placed {
          background:#e0f2fe;
          color:#075985;
        }
        .tiny-in-progress {
          background:#fef3c7;
          color:#92400e;
        }
        .tiny-delivered,
        .tiny-completed {
          background:#dcfce7;
          color:#166534;
        }
        .tiny-cancelled {
          background:#fee2e2;
          color:#b91c1c;
        }
        .tiny-service {
          background:#e5e7eb;
          color:#111827;
        }

        .tiny-muted {
          font-size:11px;
          color:#6b7280;
        }

        .dot-online {
          width:8px;
          height:8px;
          border-radius:999px;
          background:#22c55e;
          box-shadow:0 0 0 6px rgba(34,197,94,.25);
        }
        .legend-dot {
          width:10px;
          height:10px;
          border-radius:999px;
        }

        @media (max-width: 1200px) {
          .charts-row {
            grid-template-columns:1.5fr 1.5fr;
          }
        }
        @media (max-width: 992px) {
          .adm-summaries {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .charts-row {
            grid-template-columns:1fr;
          }
        }
        @media (max-width: 600px) {
          .adm-page {
            padding:16px;
          }
          .adm-summaries {
            grid-template-columns:1fr;
          }
        }
      `}</style>
    </div>
  );
}
