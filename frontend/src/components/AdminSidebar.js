import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineShop,
  AiOutlineShopping,
  AiOutlineGift,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
} from "react-icons/ai";
import { AiOutlineMail } from "react-icons/ai";

export default function AdminSidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { label: "Dashboard", to: "/admin/dashboard", icon: <AiOutlineDashboard /> },
    { label: "Products", to: "/admin/products", icon: <AiOutlineShop /> },
    { label: "Orders", to: "/admin/orders", icon: <AiOutlineShopping /> },
    { label: "Bulk Discount", to: "/admin/bulk-discount", icon: <AiOutlineGift /> },
    { label: "Service Requests", to: "/admin/service-requests", icon: <AiOutlineMail /> },
  ];

  return (
    <aside
      className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="sidebar-top">
        <div className="brand">{collapsed ? "N" : "Admin"}</div>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed((s) => !s)}
        >
          {collapsed ? <AiOutlineMenuUnfold /> : <AiOutlineMenuFold />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menu.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            onClick={onClose}
            className={({ isActive }) =>
              "sidebar-item" + (isActive ? " active" : "")
            }
          >
            <div className="icon">{m.icon}</div>
            {!collapsed && <div className="label">{m.label}</div>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
