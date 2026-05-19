import React, { Suspense, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial } from "@react-three/drei";
import "./Home.css";

/* ---------- Subtle ambient 3D background (not the product) ---------- */
const AmbientShape = ({ position, color, scale = 1 }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.1;
      ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });
  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={0.35}
          speed={1.5}
          roughness={0.1}
          metalness={0.3}
          opacity={0.55}
          transparent
        />
      </mesh>
    </Float>
  );
};

const AmbientScene = () => (
  <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
    <ambientLight intensity={0.6} />
    <directionalLight position={[5, 5, 5]} intensity={0.8} />
    <Suspense fallback={null}>
      <AmbientShape position={[-3.5, 1.5, -2]} color="#c4b5fd" scale={1.2} />
      <AmbientShape position={[3.5, -1.5, -1]} color="#fbcfe8" scale={1.4} />
      <AmbientShape position={[2.5, 2, -3]} color="#bae6fd" scale={0.9} />
      <Environment preset="studio" />
    </Suspense>
  </Canvas>
);

/* ---------- Phone with mouse-tracking 3D tilt ---------- */
const TiltPhone = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-150, 150], [12, -12]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-150, 150], [-12, 12]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      className="tilt-wrapper"
      onMouseMove={handleMouse}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        className="phone-mockup"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=90&auto=format"
          alt="Premium smartphone"
          className="phone-img"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
        {/* Floating accent cards */}
        <motion.div
          className="float-card card-spec"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="card-icon">⚡</div>
          <div>
            <p className="card-label">Performance</p>
            <p className="card-value">A17 Pro Chip</p>
          </div>
        </motion.div>

        <motion.div
          className="float-card card-camera"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{ transform: "translateZ(80px)" }}
        >
          <div className="card-icon">📸</div>
          <div>
            <p className="card-label">Pro Camera</p>
            <p className="card-value">48MP Triple</p>
          </div>
        </motion.div>

        <motion.div
          className="float-card card-rating"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          style={{ transform: "translateZ(50px)" }}
        >
          <div className="rating-stars">★★★★★</div>
          <p className="card-value">4.9 / 5.0</p>
          <p className="card-label">12,847 reviews</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

/* ---------- Data ---------- */
const featuredPhones = [
  {
    name: "iPhone 15 Pro Max",
    tagline: "Titanium. So strong. So light.",
    price: "$1,199",
    img: "https://images.unsplash.com/photo-1696446702183-be9605e25712?w=500&q=85&auto=format",
  },
  {
    name: "Galaxy S24 Ultra",
    tagline: "Galaxy AI is here.",
    price: "$1,299",
    img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=85&auto=format",
  },
  {
    name: "Pixel 8 Pro",
    tagline: "The best of Google.",
    price: "$999",
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=85&auto=format",
  },
  {
    name: "OnePlus 12",
    tagline: "Never settle.",
    price: "$799",
    img: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&q=85&auto=format",
  },
];

const brands = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Nothing", "Sony", "Motorola"];

const features = [
  { icon: "🚚", title: "Free Delivery", desc: "Complimentary 2-day shipping on every order over $50." },
  { icon: "🛡️", title: "2-Year Warranty", desc: "Comprehensive protection on every device, parts and labor included." },
  { icon: "💳", title: "Flexible Financing", desc: "0% APR for 24 months on approved credit. No hidden fees." },
  { icon: "↩️", title: "30-Day Returns", desc: "Not in love? Return it, no questions asked, full refund guaranteed." },
];

/* ---------- Animations ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const Home = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div ref={containerRef} className="home-wrapper">

      {/* ============ HERO ============ */}
      <section className="hero-section">
        <div className="hero-bg-3d">
          <AmbientScene />
        </div>

        <motion.div style={{ y: heroY }} className="hero-content">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hero-eyebrow"
          >
            <span className="pulse-dot"></span> New Flagship Collection 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hero-title"
          >
            Premium devices,
            

            <span className="accent-text">redefined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="hero-sub"
          >
            Curated flagship smartphones from the world's leading brands.
            Authentic, warrantied, and delivered in days — not weeks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="hero-actions"
          >
            <button className="btn btn-primary">
              Shop Collection
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn btn-ghost">Compare Models</button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="hero-trust"
          >
            <div className="trust-item">
              <strong>50,000+</strong>
              <span>Customers worldwide</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <strong>4.9 / 5</strong>
              <span>Trustpilot rating</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <strong>200+</strong>
              <span>Models in stock</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="hero-visual">
          <TiltPhone />
        </div>
      </section>

      {/* ============ BRAND STRIP ============ */}
<section className="brand-strip">
<motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="strip-label"
>
          Trusted by enthusiasts · Authorized by brands
</motion.p>
<div className="marquee">
<motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="marquee-track"
>
            {[...brands, ...brands].map((b, i) => (
<span key={i} className="brand-item">{b}</span>
            ))}
</motion.div>
</div>
</section>
 
      {/* ============ FEATURED PRODUCTS ============ */}
<section className="section section-products">
<motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-header section-header-split"
>
<div>
<span className="section-eyebrow">— Featured Collection</span>
<h2 className="section-title">
              This season's <em>most&nbsp;wanted</em>
</h2>
</div>
<div className="section-header-aside">
<p className="section-sub">
              Handpicked flagships defining the future of mobile — each device
              authenticated, warrantied, and ready to ship.
</p>
<button className="link-btn">
              View all devices <span>→</span>
</button>
</div>
</motion.div>
 
        <div className="products-grid">
          {featuredPhones.map((phone, i) => (
<motion.article
              key={phone.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="product-card"
>
<div className="product-image-wrap">
<span className="product-tag">New</span>
<motion.img
                  src={phone.img}
                  alt={phone.name}
                  className="product-image"
                  whileHover={{ scale: 1.08, rotate: -2 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                />
<motion.button
                  className="product-wishlist"
                  aria-label="Add to wishlist"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
>
                  ♡
</motion.button>
<div className="product-overlay">
<button className="overlay-btn">Quick View</button>
</div>
</div>
<div className="product-info">
<div className="product-meta">
<span className="product-rating">★ 4.9</span>
<span className="product-stock">In stock</span>
</div>
<h3 className="product-name">{phone.name}</h3>
<p className="product-tagline">{phone.tagline}</p>
<div className="product-footer">
<div>
<span className="product-price">{phone.price}</span>
<span className="product-emi">or $50/mo</span>
</div>
<motion.button
                    className="product-cta"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
>
                    View <span>→</span>
</motion.button>
</div>
</div>
</motion.article>
          ))}
</div>
</section>
 
      {/* ============ SHOWCASE / EDITORIAL BANNER ============ */}
<section className="showcase-section">
<motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="showcase-inner"
>
<div className="showcase-content">
<span className="section-eyebrow light">— Limited Edition</span>
<h2 className="showcase-title">
              Titanium.<br />
<em>Engineered to last.</em>
</h2>
<p className="showcase-sub">
              The new generation of flagship devices — featuring aerospace-grade
              materials, AI-powered cameras, and all-day battery life.
</p>
<div className="showcase-stats">
<div>
<strong>48MP</strong>
<span>Pro Camera</span>
</div>
<div>
<strong>120Hz</strong>
<span>ProMotion</span>
</div>
<div>
<strong>1TB</strong>
<span>Storage</span>
</div>
</div>
<button className="btn btn-light">
              Discover the collection <span className="btn-arrow">→</span>
</button>
</div>
<motion.div
            className="showcase-visual"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
>
<motion.img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=90&auto=format"
              alt="Premium phone"
              animate={{ y: [0, -18, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />
<div className="showcase-glow" />
</motion.div>
</motion.div>
</section>
 
      {/* ============ FEATURES ============ */}
<section className="features-section">
<motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-header"
>
<span className="section-eyebrow">— Why MobiVerse</span>
<h2 className="section-title">
            Built around <em>your experience</em>
</h2>
<p className="section-sub">
            Every detail — from checkout to unboxing — designed to feel effortless.
</p>
</motion.div>
 
        <div className="features-grid">
          {features.map((f, i) => (
<motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="feature-card"
>
<div className="feature-number">0{i + 1}</div>
<motion.div
                className="feature-icon"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
>
                {f.icon}
</motion.div>
<h3 className="feature-title">{f.title}</h3>
<p className="feature-desc">{f.desc}</p>
<div className="feature-arrow">→</div>
</motion.div>
          ))}
</div>
</section>
 
      {/* ============ TESTIMONIALS ============ */}
<section className="testimonials-section">
<motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
>
<span className="section-eyebrow">— Loved by thousands</span>
<h2 className="section-title">What our customers say</h2>
</motion.div>
 
        <div className="testimonials-grid">
          {[
            {
              quote: "Fastest delivery I've ever experienced. The phone arrived in pristine condition with thoughtful packaging.",
              name: "Sarah K.",
              role: "Verified Buyer",
              avatar: "https://i.pravatar.cc/100?img=1",
            },
            {
              quote: "Authentic device, perfect price, and incredible support. MobiVerse has earned a lifetime customer.",
              name: "James M.",
              role: "Verified Buyer",
              avatar: "https://i.pravatar.cc/100?img=12",
            },
            {
              quote: "The financing options made it possible to get the flagship I'd been eyeing for months. Highly recommend.",
              name: "Priya R.",
              role: "Verified Buyer",
              avatar: "https://i.pravatar.cc/100?img=5",
            },
          ].map((t, i) => (
<motion.figure
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="testimonial-card"
>
<div className="testimonial-stars">★★★★★</div>
<blockquote>"{t.quote}"</blockquote>
<figcaption>
<img src={t.avatar} alt={t.name} />
<div>
<strong>{t.name}</strong>
<span>{t.role}</span>
</div>
</figcaption>
</motion.figure>
          ))}
</div>
</section>
 
      {/* ============ CTA ============ */}
<section className="cta-section">
<motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="cta-inner"
>
<motion.div
            className="cta-grain"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 20 }}
          />
<span className="section-eyebrow light">— Join the experience</span>
<h2 className="cta-title">
            Your next device,<br />
<em>delivered with care.</em>
</h2>
<p className="cta-sub">
            Join 50,000+ customers who've found their perfect device with MobiVerse.
</p>
<div className="cta-actions">
<motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn btn-light"
>
              Browse all devices <span className="btn-arrow">→</span>
</motion.button>
<motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn btn-ghost-dark"
>
              Talk to an expert
</motion.button>
</div>
</motion.div>
</section>
 

</div>
  );
};
 
export default Home;