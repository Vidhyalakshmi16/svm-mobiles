import { Link } from "react-router-dom";
import "./Home.css";


function Home() {
  return (
    <div className="home-page">
      {/* Banner Section */}
      <section className="banner">
        <div className="banner-content text-center">
          <h1 className="display-4 fw-bold">Sri Vaari Mobiles</h1>
          <p className="lead">
            Your trusted destination for mobiles, accessories & quick service support.
          </p>
          <Link to="/products" className="btn btn-warning btn-lg mt-3 shadow">
            🛍️ Shop Now
          </Link>
        </div>
      </section>

      {/* Offers Section */}
      <section className="offers container my-5 text-center">
        <h2 className="mb-4 fw-bold">🔥 Special Offers</h2>
        <div className="row justify-content-center">
          <div className="col-md-3 mb-3">
            <div className="offer-card p-3 shadow-sm rounded">
              <h5>iPhone 17 Launch Offer</h5>
              <p>Flat ₹5,000 off on pre-booking!</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="offer-card p-3 shadow-sm rounded">
              <h5>Accessories Bonanza</h5>
              <p>Buy 2, Get 1 Free 🎧</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="offer-card p-3 shadow-sm rounded">
              <h5>Exchange Offer</h5>
              <p>Exchange old phones & save up to ₹10,000 💰</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories container my-5">
        <h2 className="text-center mb-4 fw-bold">📱 Shop by Category</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="category-card p-3 shadow-lg rounded">
              <img
                src="https://suprememobiles.in/cdn/shop/files/1_2ab6c803-16e7-4e9d-8177-09689c589a8a.webp?v=1738819846"
                alt="Mobiles"
                className="img-fluid rounded mb-3"
              />
              <h5>Mobiles</h5>
              <Link to="/products" className="btn btn-dark btn-sm mt-2">
                Explore
              </Link>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="category-card p-3 shadow-lg rounded">
              <img
                src="https://m.media-amazon.com/images/I/61HicEZ2vhL.jpg"
                alt="Accessories"
                className="img-fluid rounded mb-3"
              />
              <h5>Accessories</h5>
              <Link to="/products" className="btn btn-dark btn-sm mt-2">
                Explore
              </Link>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="category-card p-3 shadow-lg rounded">
              <img
                src="https://img.lovepik.com/element/40154/9877.png_1200.png"
                alt="Services"
                className="img-fluid rounded mb-3"
              />
              <h5>Mobile Services</h5>
              <Link to="/services" className="btn btn-dark btn-sm mt-2">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
