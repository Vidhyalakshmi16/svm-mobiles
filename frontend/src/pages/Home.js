import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      {/* HERO / BANNER */}
      <section className="hero">
        <div className="hero-content">
          <h1>Sri Vaari Mobiles</h1>
          <p>
            Mobiles, accessories, and trusted service — all in one place.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-dark btn-lg">
              Shop Mobiles
            </Link>
            <Link to="/services" className="btn btn-outline-light btn-lg">
              Book Service
            </Link>
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section className="container my-5">
        <h2 className="section-title">Current Offers</h2>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="offer-box">
              <h5>New Launch Deals</h5>
              <p>Special prices on latest smartphones</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="offer-box">
              <h5>Accessories Combo</h5>
              <p>Save more on chargers, cases & earphones</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="offer-box">
              <h5>Exchange Benefits</h5>
              <p>Get best value for your old mobile</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container my-5">
        <h2 className="section-title text-center">Shop by Category</h2>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="category-box">
              <img
                src="https://suprememobiles.in/cdn/shop/files/1_2ab6c803-16e7-4e9d-8177-09689c589a8a.webp"
                alt="Mobiles"
              />
              <div className="category-info">
                <h5>Mobiles</h5>
                <Link to="/products" className="btn btn-sm btn-dark">
                  Explore
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="category-box">
              <img
                src="https://m.media-amazon.com/images/I/61HicEZ2vhL.jpg"
                alt="Accessories"
              />
              <div className="category-info">
                <h5>Accessories</h5>
                <Link to="/products" className="btn btn-sm btn-dark">
                  Explore
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="category-box">
              <img
                src="https://img.lovepik.com/element/40154/9877.png_1200.png"
                alt="Service"
              />
              <div className="category-info">
                <h5>Mobile Services</h5>
                <Link to="/services" className="btn btn-sm btn-dark">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
