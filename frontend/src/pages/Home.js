import React, { Suspense, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    if (window.matchMedia("(hover: none)").matches) return;
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
 
/* ---------- Phone Finder (interactive quiz) ---------- */
const finderQuestions = [
  {
    key: "priority",
    label: "What matters most to you?",
    options: [
      { id: "camera",  icon: "📸", label: "Camera",      desc: "Pro-level photos & video" },
      { id: "gaming",  icon: "🎮", label: "Performance", desc: "Gaming & heavy multitasking" },
      { id: "battery", icon: "🔋", label: "Battery",     desc: "All-day, every day" },
      { id: "budget",  icon: "💰", label: "Value",       desc: "Best bang for the buck" },
    ],
  },
  {
    key: "budget",
    label: "What's your budget?",
    options: [
      { id: "low",  icon: "🪙", label: "Under ₹60,000",       desc: "Smart picks" },
      { id: "mid",  icon: "💵", label: "₹60,000 – ₹100,000", desc: "Sweet spot" },
      { id: "high", icon: "💎", label: "₹100,000+",         desc: "Flagship tier" },
      { id: "any",  icon: "✨", label: "No limit",         desc: "Show me the best" },
    ],
  },
  {
    key: "ecosystem",
    label: "Preferred ecosystem?",
    options: [
      { id: "ios",     icon: "🍎", label: "iOS",     desc: "Apple devices" },
      { id: "android", icon: "🤖", label: "Android", desc: "Open & flexible" },
      { id: "either",  icon: "🔀", label: "Either",  desc: "I'm flexible" },
    ],
  },
];
 
const recommendations = {
  "camera|high|ios":     { name: "iPhone 15 Pro Max", price: "₹1,19,900", reason: "48MP Pro camera + ProRAW + cinematic 4K video.", img: "https://images.unsplash.com/photo-1696446702183-be9605e25712?w=500&q=85&auto=format" },
  "camera|high|android": { name: "Galaxy S24 Ultra",  price: "₹1,29,900", reason: "200MP main sensor with 100x Space Zoom.",        img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=85&auto=format" },
  "camera|mid|android":  { name: "Pixel 8 Pro",       price: "₹89,900",   reason: "Google's computational photography magic.",      img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=85&auto=format" },
  "gaming|high|android": { name: "Galaxy S24 Ultra",  price: "₹1,29,900", reason: "Snapdragon 8 Gen 3 + 12GB RAM, no compromises.", img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=85&auto=format" },
  "gaming|high|ios":     { name: "iPhone 15 Pro Max", price: "₹1,19,900", reason: "A17 Pro chip — console-grade mobile gaming.",    img: "https://images.unsplash.com/photo-1696446702183-be9605e25712?w=500&q=85&auto=format" },
  "battery|mid|android": { name: "OnePlus 12",        price: "₹79,900",   reason: "5400mAh + 100W SuperVOOC charging.",             img: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&q=85&auto=format" },
  "budget|low|android":  { name: "Pixel 7a",          price: "₹44,900",   reason: "Flagship features at a mid-range price.",        img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=85&auto=format" },
  "budget|mid|android":  { name: "OnePlus 12",        price: "₹79,900",   reason: "Best specs-per-rupee on the market.",           img: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=500&q=85&auto=format" },
};
 
const fallbackPhone = {
  name: "Galaxy S24 Ultra",
  price: "₹1,29,900",
  reason: "An all-rounder that excels at everything.",
  img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=85&auto=format",
};
 
const PhoneFinder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const total = finderQuestions.length;
  const done = step >= total;
 
  const pickAnswer = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  };
 
  const reset = () => {
    setAnswers({});
    setStep(0);
  };
 
  const getMatch = () => {
    const k = `${answers.priority}|${answers.budget}|${answers.ecosystem}`;
    if (recommendations[k]) return recommendations[k];
    const partial = Object.keys(recommendations).find((key) => {
      const [p, , e] = key.split("|");
      return p === answers.priority && (e === answers.ecosystem || answers.ecosystem === "either");
    });
    return partial ? recommendations[partial] : fallbackPhone;
  };
 
  const current = finderQuestions[step];
  const progress = (step / total) * 100;
 
  return (
<section className="finder-section">
<motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="section-header"
>
<span className="section-eyebrow">— Personalized for you</span>
<h2 className="section-title">
          Find your <em>perfect&nbsp;phone</em>
</h2>
<p className="section-sub">
          Answer 3 quick questions. We'll match you with the device that actually fits your life.
</p>
</motion.div>
 
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="finder-card"
>
        {/* Progress bar */}
<div className="finder-progress">
<div className="finder-progress-meta">
<span>{done ? "Your match" : `Question ${step + 1} of ${total}`}</span>
<span>{Math.round(done ? 100 : progress)}%</span>
</div>
<div className="finder-progress-bar">
<motion.div
              className="finder-progress-fill"
              animate={{ width: `${done ? 100 : progress}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            />
</div>
</div>
 
        {/* Question or Result */}
        {!done ? (
<motion.div
            key={current.key}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="finder-step"
>
<h3 className="finder-question">{current.label}</h3>
<div className="finder-options">
              {current.options.map((opt, i) => (
<motion.button
                  key={opt.id}
                  onClick={() => pickAnswer(current.key, opt.id)}
                  className="finder-option"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
>
<span className="finder-option-icon">{opt.icon}</span>
<span className="finder-option-label">{opt.label}</span>
<span className="finder-option-desc">{opt.desc}</span>
</motion.button>
              ))}
</div>
 
            {step > 0 && (
<button className="finder-back" onClick={() => setStep((s) => s - 1)}>
                ← Back
</button>
            )}
</motion.div>
        ) : (
<motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="finder-result"
>
            {(() => {
              const phone = getMatch();
              return (
<>
<div className="finder-result-image">
<motion.img
                      src={phone.img}
                      alt={phone.name}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    />
<div className="finder-result-glow" />
</div>
<div className="finder-result-body">
<span className="finder-result-badge">✨ Your perfect match</span>
<h3 className="finder-result-name">{phone.name}</h3>
<p className="finder-result-reason">{phone.reason}</p>
<div className="finder-result-price">
<span>{phone.price}</span>
<small>or ₹4,500/mo with financing</small>
</div>
<div className="finder-result-actions">
<button className="btn btn-primary" onClick={() => navigate("/products") }>
                        View details <span className="btn-arrow">→</span>
</button>
<button className="btn btn-ghost" onClick={reset}>
                        Start over
</button>
</div>
</div>
</>
              );
            })()}
</motion.div>
        )}
</motion.div>
</section>
  );
};
 
/* ---------- Data ---------- */
const brands = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Nothing", "Sony", "Motorola"];
 
const features = [
  { icon: "🚚", title: "Free Delivery", desc: "Complimentary 2-day shipping on every order over ₹3,999." },
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
  const navigate = useNavigate();
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
<br />
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
<button className="btn btn-primary" onClick={() => navigate("/products") }>
              Shop Collection
<span className="btn-arrow">→</span>
</button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
 
      {/* ============ FIND YOUR PERFECT PHONE ============ */}
<PhoneFinder />
 
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
              Titanium.
<br />
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
<button className="btn btn-light" onClick={() => navigate("/products") }>
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
            Your next device,
<br />
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
              onClick={() => navigate("/products") }
>
              Browse all devices <span className="btn-arrow">→</span>
</motion.button>
<motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn btn-ghost-dark"
              onClick={() => navigate("/contact") }
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