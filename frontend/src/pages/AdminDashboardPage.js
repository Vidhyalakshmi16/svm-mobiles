import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getProducts,
  getOrdersApi,
  getServiceRequests,
} from "../services/api";
import {
  FiShoppingBag,
  FiTrendingUp,
  FiTool,
  FiPercent,
  FiUser,
  FiMapPin,
  FiPhone,
  FiSmartphone,
  FiDollarSign,
  FiArrowUpRight,
} from "react-icons/fi";
 
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
 
import "./AdminDashboardPage.css";
 
const PIE_COLORS = ["#0a0a0a", "#f59e0b", "#10b981", "#ef4444"];
 
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  }),
};
 
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
 
  const liveProducts = products.filter((p) => (p.stock ?? 0) > 0);
  const formatINR = (num = 0) =>
    Number(num || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
 
  // ======= Derived metrics (unchanged) =======
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
 
  const statusCounts = {
    Placed: orders.filter((o) => !o.status || o.status === "Placed").length,
    "In Progress": orders.filter((o) => o.status === "In Progress").length,
    Delivered: orders.filter((o) => o.status === "Delivered").length,
    Cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };
 
  const discountedProducts = [...products]
    .filter((p) => p.discount && p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 5);
 
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);
 
  const recentService = [...serviceRequests]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);
 
  // ======= Chart data =======
  const dailyMap = {};
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const d = new Date(o.createdAt);
    const key = d.toISOString().slice(0, 10);
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
 
  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));
 
  // ======= KPI cards data =======
  const kpis = [
    {
      label: "Total Revenue",
      value: `₹${formatINR(totalRevenue)}`,
      meta: "From delivered / completed orders",
      icon: <FiTrendingUp />,
      accent: "indigo",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      meta: `${pendingOrders.length} active · ${cancelledOrders.length} cancelled`,
      icon: <FiShoppingBag />,
      accent: "amber",
    },
    {
      label: "Service Requests",
      value: totalServiceRequests,
      meta: `${newServiceRequests} new waiting`,
      icon: <FiTool />,
      accent: "rose",
    },
    {
      label: "Products Live",
      value: liveProducts.length,
      meta: `${discountedProducts.length} with discounts`,
      icon: <FiPercent />,
      accent: "emerald",
    },
    {
      label: "Actual Profit",
      value: `₹${formatINR(actualProfit)}`,
      meta: "Selling price minus cost",
      icon: <FiDollarSign />,
      accent: "violet",
    },
  ];
 
  return (
<div className="adm-wrapper">
      {/* ============ HEADER ============ */}
<motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="adm-header"
>
<div>
<span className="adm-eyebrow">— Admin</span>
<h1 className="adm-title">
            Business <em>overview</em>
</h1>
<p className="adm-sub">
            A snapshot of sales, orders and service activity across MobiVerse.
</p>
</div>
<div className="adm-live-pill">
<span className="live-dot" /> Live data
</div>
</motion.header>
 
      {loading ? (
<div className="adm-skeleton-grid">
          {[...Array(5)].map((_, i) => (
<div key={i} className="adm-skeleton-card" />
          ))}
</div>
      ) : (
<>
          {/* ============ KPI CARDS ============ */}
<section className="adm-kpis">
            {kpis.map((k, i) => (
<motion.div
                key={k.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`adm-kpi adm-kpi--${k.accent}`}
>
<div className="adm-kpi-head">
<span className="adm-kpi-label">{k.label}</span>
<span className="adm-kpi-icon">{k.icon}</span>
</div>
<div className="adm-kpi-value">{k.value}</div>
<div className="adm-kpi-meta">{k.meta}</div>
</motion.div>
            ))}
</section>
 
          {/* ============ CHARTS ROW ============ */}
<section className="adm-charts">
            {/* Line Chart */}
<motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="adm-panel adm-panel--wide"
>
<div className="adm-panel-head">
<div>
<span className="adm-eyebrow small">— Performance</span>
<h3>Revenue & orders</h3>
</div>
<span className="adm-panel-meta">Trend over time</span>
</div>
 
              {dailyStats.length === 0 ? (
<div className="adm-empty-mini">Not enough data yet.</div>
              ) : (
<div className="adm-chart-area">
<ResponsiveContainer width="100%" height="100%">
<LineChart
                      data={dailyStats}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
>
<defs>
<linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#0a0a0a" stopOpacity={0.2} />
<stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
</linearGradient>
</defs>
<CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e7e5e4"
                        vertical={false}
                      />
<XAxis
                        dataKey="dateLabel"
                        stroke="#737373"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
<YAxis
                        yAxisId="left"
                        stroke="#737373"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${formatINR(v)}`}
                      />
<YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#737373"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
<Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e7e5e4",
                          background: "#ffffff",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                          fontSize: 12,
                        }}
                        formatter={(value, name) =>
                          name === "Revenue"
                            ? `₹${formatINR(value)}`
                            : `${value} orders`
                        }
                      />
<Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      />
<Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#0a0a0a"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 5, fill: "#0a0a0a" }}
                      />
<Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ordersCount"
                        name="Orders"
                        stroke="#4f46e5"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 5, fill: "#4f46e5" }}
                      />
</LineChart>
</ResponsiveContainer>
</div>
              )}
</motion.div>
 
            {/* Pie Chart */}
<motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="adm-panel"
>
<div className="adm-panel-head">
<div>
<span className="adm-eyebrow small">— Status</span>
<h3>Order breakdown</h3>
</div>
</div>
 
              {pieData.length === 0 ? (
<div className="adm-empty-mini">No orders yet.</div>
              ) : (
<div className="adm-pie-wrap">
<div className="adm-pie-chart">
<ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="62%"
                          outerRadius="92%"
                          stroke="#ffffff"
                          strokeWidth={3}
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
                            border: "1px solid #e7e5e4",
                            background: "#ffffff",
                            fontSize: 12,
                          }}
                        />
</PieChart>
</ResponsiveContainer>
<div className="adm-pie-center">
<span>{totalOrders}</span>
<small>Total</small>
</div>
</div>
<div className="adm-pie-legend">
                    {pieData.map((item, idx) => (
<div key={item.name} className="adm-legend-row">
<span className="adm-legend-left">
<span
                            className="adm-legend-dot"
                            style={{
                              background: PIE_COLORS[idx % PIE_COLORS.length],
                            }}
                          />
                          {item.name}
</span>
<strong>{item.value}</strong>
</div>
                    ))}
</div>
</div>
              )}
</motion.div>
 
            {/* Top Discounts */}
<motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="adm-panel"
>
<div className="adm-panel-head">
<div>
<span className="adm-eyebrow small">— Promotions</span>
<h3>Top discounts</h3>
</div>
</div>
 
              {discountedProducts.length === 0 ? (
<div className="adm-empty-mini">No discounts applied.</div>
              ) : (
<ul className="adm-discount-list">
                  {discountedProducts.map((p) => (
<li key={p._id} className="adm-discount-item">
<div className="adm-discount-info">
<span className="adm-discount-name">{p.name}</span>
<span className="adm-discount-meta">
                          {p.brand} · ₹{formatINR(p.finalPrice ?? p.price)}
</span>
</div>
<span className="adm-discount-tag">{p.discount}% OFF</span>
</li>
                  ))}
</ul>
              )}
</motion.div>
</section>
 
          {/* ============ TABLES ROW ============ */}
<section className="adm-tables">
            {/* Recent Orders */}
<motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="adm-panel"
>
<div className="adm-panel-head">
<div>
<span className="adm-eyebrow small">— Latest activity</span>
<h3>Recent orders</h3>
</div>
<a href="/admin/orders" className="adm-link">
                  View all <FiArrowUpRight />
</a>
</div>
 
              {recentOrders.length === 0 ? (
<div className="adm-empty-mini">No orders yet.</div>
              ) : (
<div className="adm-list">
                  {recentOrders.map((o) => (
<div key={o._id} className="adm-list-row">
<div className="adm-list-left">
<span className="adm-list-id">
                          #{String(o._id).slice(-8)}
</span>
<span className="adm-list-name">
                          {o.customer?.name || "—"}
</span>
<span className="adm-list-meta">
                          {o.createdAt &&
                            new Date(o.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
</span>
</div>
<div className="adm-list-right">
<span className="adm-list-amount">
                          ₹{formatINR(o.total)}
</span>
<span
                          className={`adm-status adm-status--${(
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
</motion.div>
 
            {/* Recent Service Requests */}
<motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="adm-panel"
>
<div className="adm-panel-head">
<div>
<span className="adm-eyebrow small">— Service</span>
<h3>Recent service requests</h3>
</div>
<a href="/admin/service-requests" className="adm-link">
                  View all <FiArrowUpRight />
</a>
</div>
 
              {recentService.length === 0 ? (
<div className="adm-empty-mini">No service requests yet.</div>
              ) : (
<div className="adm-list">
                  {recentService.map((r) => (
<div key={r._id} className="adm-list-row">
<div className="adm-list-left">
<span className="adm-list-name">
<FiUser size={12} /> {r.name}
</span>
<span className="adm-list-meta">
<FiPhone size={11} /> {r.phone}
</span>
                        {r.deviceBrand && (
<span className="adm-list-meta">
<FiSmartphone size={11} /> {r.deviceBrand}
                            {r.deviceModel ? ` · ${r.deviceModel}` : ""}
</span>
                        )}
</div>
<div className="adm-list-right">
<span className="adm-list-meta">
<FiMapPin size={11} /> {r.city || ""}
                          {r.pincode ? ` · ${r.pincode}` : ""}
</span>
<span className="adm-status adm-status--service">
                          {r.status || "New"}
</span>
</div>
</div>
                  ))}
</div>
              )}
</motion.div>
</section>
</>
      )}
</div>
  );
}