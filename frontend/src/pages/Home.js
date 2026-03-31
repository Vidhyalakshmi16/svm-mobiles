import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Home.css";

/* ── Animated counter hook ── */
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = null;
        const step = (ts) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
}

/* ── Scroll reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);
  return ref;
}

/* ── Stat counter component ── */
function StatCounter({ target, suffix, label }) {
  const [count, ref] = useCounter(target);
  return (
    <div className="stat-item" ref={ref}>
      <strong>{count}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function Home() {
  /* cursor glow */
  useEffect(() => {
    const glow = document.getElementById("cursor-glow");
    const move = (e) => {
      if (!glow) return;
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const offersRef = useReveal();
  const catRef    = useReveal();
  const whyRef    = useReveal();

  const offers = [
    { icon: "📱", label: "iPhone 17 Launch", desc: "Flat ₹5,000 off on pre-booking", tag: "Pre-book Now", delay: "0s" },
    { icon: "🎧", label: "Accessories Bonanza", desc: "Buy 2 accessories, Get 1 Free", tag: "Grab Deal", delay: "0.1s" },
    { icon: "🔄", label: "Exchange Offer", desc: "Save up to ₹10,000 on exchange", tag: "Exchange Now", delay: "0.2s" },
    { icon: "🛡️", label: "Screen Guard Free", desc: "Free tempered glass with every phone", tag: "Claim Now", delay: "0.3s" },
  ];

  const categories = [
    {
      label: "Mobiles",
      desc: "Latest smartphones from all top brands",
      img: "https://suprememobiles.in/cdn/shop/files/1_2ab6c803-16e7-4e9d-8177-09689c589a8a.webp?v=1738819846",
      to: "/products",
      cta: "Explore",
    },
    {
      label: "Accessories",
      desc: "Cases, chargers, earbuds & more",
      img: "https://m.media-amazon.com/images/I/61HicEZ2vhL.jpg",
      to: "/products",
      cta: "Explore",
    },
    {
      label: "Repair Services",
      desc: "Fast repairs by certified technicians",
      img: "https://img.lovepik.com/element/40154/9877.png_1200.png",
      to: "/services",
      cta: "Book Now",
    },
  ];

  const whyUs = [
    { icon: "🛡️", title: "100% Genuine", desc: "Authentic products from authorised distributors only." },
    { icon: "⚡", title: "Same-Day Repair", desc: "Most screen & battery fixes done within 24 hours." },
    { icon: "💬", title: "Expert Advice", desc: "Our team helps you pick the right phone for your budget." },
    { icon: "🔁", title: "Easy Exchange", desc: "Hassle-free exchange with instant cashback on old phones." },
  ];

  const tickerItems = [
    "🔥 iPhone 17 — Flat ₹5,000 off on pre-booking",
    "🎧 Buy 2 Accessories Get 1 Free",
    "💰 Exchange old phones & save up to ₹10,000",
    "⚡ Same-day screen replacement available",
    "🎁 Free tempered glass with every phone purchase",
    "📞 Call us: 98765 43210",
  ];

  return (
    <div className="home-page">
      {/* Cursor glow */}
      <div id="cursor-glow" aria-hidden="true" />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-radial" aria-hidden="true" />

        {/* Floating orbs */}
        <div className="orb orb1" aria-hidden="true" />
        <div className="orb orb2" aria-hidden="true" />
        <div className="orb orb3" aria-hidden="true" />

        {/* Grid */}
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-badge">
            <span className="pulse-ring" />
            <span className="pulse-dot" />
            Salem's #1 Mobile Store
          </div>

          <h1 className="hero-heading">
            <span className="line line1">Sri Vaari</span>
            <span className="line line2">
              <span className="gold-stroke">Mobiles</span>
            </span>
          </h1>

          <p className="hero-para">
            Your trusted destination for smartphones,<br className="br-hide" />
            accessories &amp; lightning-fast repairs.
          </p>

          <div className="hero-btns">
            <Link to="/products" className="btn-gold">
              <span className="btn-shine" />
              Shop Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/services" className="btn-outline">
              Book a Repair
            </Link>
          </div>

          <div className="hero-stats">
            <StatCounter target={500}  suffix="+"  label="Phones Sold" />
            <div className="stat-sep" />
            <StatCounter target={1000} suffix="+"  label="Happy Customers" />
            <div className="stat-sep" />
            <StatCounter target={24}   suffix="hr" label="Quick Repair" />
          </div>
        </div>

        {/* Floating trust chips */}
        <div className="trust-chips">
          <div className="chip chip1">📦 Free Delivery</div>
          <div className="chip chip2">🔧 Expert Repair</div>
          <div className="chip chip3">✅ Genuine Parts</div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker">
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="tick">{t}<span className="tick-sep">✦</span></span>
          ))}
        </div>
      </div>

      {/* ── OFFERS ── */}
      <section className="sec offers-sec">
        <div className="sec-label">Limited Time</div>
        <h2 className="sec-title">Special Offers</h2>
        <p className="sec-sub">Deals too good to miss — grab them before they're gone.</p>

        <div className="offers-grid reveal-grid" ref={offersRef}>
          {offers.map((o, i) => (
            <div
              className="offer-card"
              key={i}
              style={{ "--d": o.delay }}
            >
              <div className="oc-shine" />
              <div className="oc-top">
                <span className="oc-icon">{o.icon}</span>
                <span className="oc-tag">{o.tag}</span>
              </div>
              <h3 className="oc-title">{o.label}</h3>
              <p className="oc-desc">{o.desc}</p>
              <div className="oc-bar" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="sec cat-sec">
        <div className="sec-label">Browse</div>
        <h2 className="sec-title">Shop by Category</h2>
        <p className="sec-sub">Everything you need, all under one roof.</p>

        <div className="cat-grid reveal-grid" ref={catRef}>
          {categories.map((c, i) => (
            <div className="cat-card" key={i} style={{ "--d": `${i * 0.12}s` }}>
              <div className="cat-img-wrap">
                <img src={c.img} alt={c.label} loading="lazy" />
                <div className="cat-img-overlay" />
              </div>
              <div className="cat-body">
                <div>
                  <h3 className="cat-name">{c.label}</h3>
                  <p className="cat-desc">{c.desc}</p>
                </div>
                <Link to={c.to} className="cat-btn">
                  {c.cta}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
              <div className="cat-border-glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="sec why-sec">
        <div className="sec-label">Why Us</div>
        <h2 className="sec-title">The Sri Vaari Promise</h2>

        <div className="why-grid reveal-grid" ref={whyRef}>
          {whyUs.map((w, i) => (
            <div className="why-card" key={i} style={{ "--d": `${i * 0.1}s` }}>
              <div className="why-icon-wrap">
                <span className="why-icon">{w.icon}</span>
                <div className="why-icon-ring" />
              </div>
              <h4 className="why-title">{w.title}</h4>
              <p className="why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-sec">
        <div className="cta-orb" aria-hidden="true" />
        <div className="cta-inner">
          <span className="sec-label" style={{ marginBottom: "1rem", display: "inline-block" }}>Ready?</span>
          <h2 className="cta-heading">Upgrade Your Phone Today</h2>
          <p className="cta-sub">Visit us in Salem or browse our full collection online.</p>
          <div className="hero-btns" style={{ marginTop: "2rem" }}>
            <Link to="/products" className="btn-gold">
              <span className="btn-shine" />
              Shop Collection
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/contact" className="btn-outline">Get Directions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}