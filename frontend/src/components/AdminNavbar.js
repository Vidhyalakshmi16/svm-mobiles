import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

export default function AdminNavbar({ title = "Admin Dashboard" }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="admin-navbar">
        {/* Left */}
        <div>
          <h4 className="admin-title">{title}</h4>
          <div className="admin-subtitle">
            Manage orders & service requests
          </div>
        </div>

        {/* Right */}
        <div className="admin-right">
          {/* Home icon */}
          <Link
            to="/"
            target="_blank"
            className="admin-home-icon"
            title="View Website"
          >
            <FiHome size={18} />
          </Link>

          <span className="admin-badge">ADMIN</span>

          <div className="admin-time">
            <div>{time.toLocaleDateString()}</div>
            <small>
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>
        </div>
      </header>

      {/* Inline styles */}
      <style>{`
        .admin-navbar {
          height: 72px;
          padding: 0 24px;
          background: #ffffff;
          border-bottom: 1px solid #edf0f7;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-title {
          margin: 0;
          font-weight: 700;
          color: #111827;
        }

        .admin-subtitle {
          font-size: 12px;
          color: #6b7280;
        }

        .admin-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .admin-home-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: #040404ff;
          transition: background 0.2s ease;
        }

        .admin-home-icon:hover {
          background: rgba(37, 99, 235, 0.1);
        }

        .admin-badge {
          background: #111827;
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
          letter-spacing: 0.5px;
        }

        .admin-time {
          text-align: right;
          font-size: 13px;
          color: #374151;
          line-height: 1.2;
        }
      `}</style>
    </>
  );
}
