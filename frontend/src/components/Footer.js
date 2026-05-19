import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Footer.css";

function Footer() {
  return (
    <footer className="mv-footer">
      <div className="mv-footer-glow" />

      <div className="mv-footer-inner">
        {/* Brand */}
        <div className="mv-footer-brand">
          <div className="mv-footer-logo">
            <span className="mv-footer-logo-mark">S</span>
            <span className="mv-footer-logo-text">Sri Vaari Mobiles</span>
          </div>
          <p className="mv-footer-brand-desc">
            Your one-stop shop for mobiles, accessories, and repair services.
            Quality products with trusted support.
          </p>
          <div className="mv-footer-socials">
            {[
              { href: "https://www.instagram.com/sri_vaarimobiles?igsh=ZGViYXg4c3doYjA3", icon: "bi-facebook" },
              { href: "https://www.instagram.com/sri_vaarimobiles?igsh=ZGViYXg4c3doYjA3", icon: "bi-instagram" },
              { href: "https://www.instagram.com/sri_vaarimobiles?igsh=ZGViYXg4c3doYjA3", icon: "bi-twitter-x" },
            ].map(({ href, icon }) => (
              <motion.a
                key={icon}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mv-footer-social-btn"
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className={`bi ${icon}`} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mv-footer-col">
          <h5 className="mv-footer-heading">Quick Links</h5>
          <ul className="mv-footer-links">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
              { to: "/services", label: "Services" },
              { to: "/contact", label: "Contact Us" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="mv-footer-link">
                  <span className="mv-footer-link-arrow">→</span> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="mv-footer-col">
          <h5 className="mv-footer-heading">Contact</h5>
          <ul className="mv-footer-contact-list">
            <li>
              <i className="bi bi-geo-alt" />
              <span>296/82, Tvk road, Ammapet, Salem, Tamil Nadu</span>
            </li>
            <li>
              <i className="bi bi-telephone" />
              <a href="tel:+918754674075">+91 87546 74075</a>
            </li>
            <li>
              <i className="bi bi-envelope" />
              <a href="mailto:srivaarimobiles2021@gmail.com">srivaarimobiles2021@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mv-footer-bottom">
        <div className="mv-footer-bottom-inner">
          <p>© {new Date().getFullYear()} Sri Vaari Mobiles. All Rights Reserved.</p>
          <p className="mv-footer-bottom-links">
            <a href="/home">Privacy</a>
            <span>·</span>
            <a href="/home">Terms</a>
            <span>·</span>
            <a href="/home">Cookies</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;