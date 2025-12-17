import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AiOutlineDashboard,
  // AiOutlineAreaChart,
  AiOutlineShop,
  // AiOutlineFolderOpen,
  AiOutlineShopping,
  // AiOutlineUser,
  AiOutlineGift,
  // AiOutlineDatabase,
  // AiOutlineSetting,
  AiOutlineLogout,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
} from "react-icons/ai";
import { AiOutlineMail } from "react-icons/ai";

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { label: "Dashboard", to: "/admin/dashboard", icon: <AiOutlineDashboard /> },
    // { label: "Analytics", to: "/admin/analytics", icon: <AiOutlineAreaChart /> },
    { label: "Products", to: "/admin/products", icon: <AiOutlineShop /> },
    // { label: "Categories", to: "/admin/categories", icon: <AiOutlineFolderOpen /> },
    { label: "Orders", to: "/admin/orders", icon: <AiOutlineShopping /> },
    // { label: "Customers", to: "/admin/customers", icon: <AiOutlineUser /> },
    { label: "Bulk Discount", to: "/admin/bulk-discount", icon: <AiOutlineGift /> },
    // { label: "Offers", to: "/admin/offers", icon: <AiOutlineGift /> },
    // { label: "Inventory", to: "/admin/inventory", icon: <AiOutlineDatabase /> },
    // { label: "Settings", to: "/admin/settings", icon: <AiOutlineSetting /> },
    { label: "Service Requests", to: "/admin/service-requests", icon: <AiOutlineMail /> },
    
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="brand">{collapsed ? "N" : "Admin"}</div>
        <button className="collapse-btn" onClick={() => setCollapsed((s) => !s)}>
          {collapsed ? <AiOutlineMenuUnfold /> : <AiOutlineMenuFold />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menu.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) => "sidebar-item" + (isActive ? " active" : "")}
          >
            <div className="icon">{m.icon}</div>
            {!collapsed && <div className="label">{m.label}</div>}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
