import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer mt-5 pt-5">
      <div className="container py-4">
        <div className="row">
          {/* Shop Info */}
          <div className="col-md-4 mb-3">
            <h5>Sri Vaari Mobiles</h5>
            <p>
              Your one-stop shop for mobiles, accessories, and repair services.
              We provide quality products with trusted support.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-3">
            <h5>Quick links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/products" className="footer-link">Products</Link></li>
              <li><Link to="/services" className="footer-link">Services</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-4 mb-3">
            <h5>Contact</h5>
            <p>296/82, Tvk road, Ammapet, Salem, Tamil Nadu</p>
            <p>+91 87546 74075</p>
            <p>srivaarimobiles2021@gmail.com</p>

            {/* Social Icons */}
            <div className="social-icons mt-2">
              <a href="https://www.instagram.com/sri_vaarimobiles?igsh=ZGViYXg4c3doYjA3" className="footer-icon mx-2"><i className="bi bi-facebook"></i></a>
              <a href="https://www.instagram.com/sri_vaarimobiles?igsh=ZGViYXg4c3doYjA3" className="footer-icon mx-2" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-instagram"></i></a>
              <a href="https://www.instagram.com/sri_vaarimobiles?igsh=ZGViYXg4c3doYjA3" className="footer-icon mx-2"><i className="bi bi-twitter-x"></i></a>
            </div>
          </div>
        </div>
        <hr />
        <div className="text-center">
          <small>© {new Date().getFullYear()} Sri Vaari Mobiles | All Rights Reserved.</small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
