import React from "react";
import { motion } from "framer-motion";
import {
  FaMobileAlt,
  FaBatteryFull,
  FaVolumeUp,
  FaTint,
  FaChargingStation,
  FaCogs,
  FaCamera,
  FaDatabase,
} from "react-icons/fa";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./Services.css";
 
const services = [
  { icon: <FaMobileAlt />,       title: "Screen Replacement",      desc: "Cracked or shattered display? We replace it with genuine OEM-grade panels.",        eta: "30–60 min", from: "₹1,499" },
  { icon: <FaBatteryFull />,     title: "Battery Replacement",     desc: "Draining fast or not charging? Get a brand-new, certified battery installed.",      eta: "20–40 min", from: "₹899"   },
  { icon: <FaVolumeUp />,        title: "Speaker / Mic Repair",    desc: "Distorted audio or muted calls? Precision repair for crystal-clear sound.",         eta: "45 min",    from: "₹599"   },
  { icon: <FaTint />,            title: "Water Damage Recovery",   desc: "Liquid spill? Our ultrasonic cleaning brings most devices back to life.",           eta: "24 hrs",    from: "₹1,299" },
  { icon: <FaChargingStation />, title: "Charging Port Repair",    desc: "Loose connection or no charge? Full port replacement with quality components.",    eta: "1 hr",      from: "₹799"   },
  { icon: <FaCogs />,            title: "Software & Updates",      desc: "Sluggish performance? OS reinstalls, firmware upgrades, and bootloop fixes.",       eta: "1–2 hrs",   from: "₹499"   },
  { icon: <FaCamera />,          title: "Camera Repair",           desc: "Blurry shots or dead lens? Module replacement for both front and rear cameras.",    eta: "45 min",    from: "₹999"   },
  { icon: <FaDatabase />,        title: "Data Recovery & Backup",  desc: "Lost photos, contacts, or files? Secure recovery with full privacy guaranteed.",    eta: "24–48 hrs", from: "₹1,499" },
];
 
const trustPoints = [
  "Genuine parts only",
  "90-day service warranty",
  "Free pickup & drop",
  "No-fix, no-fee guarantee",
];
 
const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
 
const Services = () => {
  const navigate = useNavigate();
 
  return (
<div className="srv-wrapper">
      {/* ============ HEADER ============ */}
<header className="srv-header">
<motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="srv-eyebrow"
>
          — Expert care
</motion.p>
 
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="srv-title"
>
          Repair &amp; <em>service</em>
</motion.h1>
 
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="srv-sub"
>
          Fast, trusted service for every major brand — with genuine parts,
          certified technicians, and transparent pricing.
</motion.p>
 
        {/* Trust strip */}
<motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="srv-trust"
>
          {trustPoints.map((t) => (
<div key={t} className="srv-trust-item">
<FiCheck size={14} /> <span>{t}</span>
</div>
          ))}
</motion.div>
</header>
 
      {/* ============ SERVICES GRID ============ */}
<div className="srv-grid">
        {services.map((s, i) => (
<motion.article
            key={s.title}
            className="srv-card"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            whileHover={{ y: -6 }}
>
<div className="srv-card-top">
<div className="srv-card-icon">{s.icon}</div>
<span className="srv-card-eta">⏱ {s.eta}</span>
</div>
 
            <h3 className="srv-card-title">{s.title}</h3>
<p className="srv-card-desc">{s.desc}</p>
 
            <div className="srv-card-foot">
<div>
<span className="srv-card-from">Starting from</span>
<span className="srv-card-price">{s.from}</span>
</div>
<button
                className="srv-card-cta"
                onClick={() => navigate("/contact")}
                aria-label={`Book ${s.title}`}
>
                Book <FiArrowRight />
</button>
</div>
</motion.article>
        ))}
</div>
 
      {/* ============ CTA BANNER ============ */}
<motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="srv-cta"
>
<div className="srv-cta-glow srv-cta-glow--left" />
<div className="srv-cta-glow srv-cta-glow--right" />
 
        <div className="srv-cta-inner">
<span className="srv-cta-eyebrow">— Not sure what's wrong?</span>
<h2 className="srv-cta-title">
            Get a free <em>diagnosis</em> in&nbsp;15&nbsp;minutes.
</h2>
<p className="srv-cta-sub">
            Walk in, drop off, or book a free pickup. Our certified technicians
            will diagnose the issue and quote a fixed price — no obligation.
</p>
 
          <div className="srv-cta-actions">
<motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="srv-btn-primary"
              onClick={() => navigate("/contact")}
>
              Book a service <FiArrowRight />
</motion.button>
<motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="srv-btn-ghost"
              onClick={() => navigate("/contact")}
>
              Talk to a technician
</motion.button>
</div>
</div>
</motion.section>
</div>
  );
};
 
export default Services;