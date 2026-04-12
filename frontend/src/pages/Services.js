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
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <FaMobileAlt size={36} />,
      title: "Screen Replacement",
      desc: "Broken or cracked screen? We replace it with high-quality, genuine displays.",
    },
    {
      icon: <FaBatteryFull size={36} />,
      title: "Battery Replacement",
      desc: "Battery draining fast or not charging? We’ll fix it with a brand-new battery.",
    },
    {
      icon: <FaVolumeUp size={36} />,
      title: "Speaker / Mic Repair",
      desc: "Can’t hear or speak properly? We’ll fix your speaker or mic in no time.",
    },
    {
      icon: <FaTint size={36} />,
      title: "Water Damage Recovery",
      desc: "Dropped your mobile in water? We’ll dry, clean, and restore it safely.",
    },
    {
      icon: <FaChargingStation size={36} />,
      title: "Charging Port Repair",
      desc: "Charging issues? We’ll repair or replace your port for smooth charging.",
    },
    {
      icon: <FaCogs size={36} />,
      title: "Software & Updates",
      desc: "Mobile running slow or stuck? We reinstall OS or upgrade firmware fast.",
    },
    {
      icon: <FaCamera size={36} />,
      title: "Camera Repair",
      desc: "Blurry or dead camera? We’ll replace or clean the camera lens perfectly.",
    },
    {
      icon: <FaDatabase size={36} />,
      title: "Data Recovery & Backup",
      desc: "Accidentally deleted photos or contacts? We’ll recover them securely.",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0 },
  };

  const BookServiceButton = () => (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="store-btn-primary px-5 py-2"
      onClick={() => navigate("/contact")}
    >
      Book a service
    </motion.button>
  );

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <p className="lux-eyebrow">Expert care</p>
        <h1 className="lux-heading-xl mb-2">Repair &amp; service</h1>
        <p className="lux-lead mx-auto">
          Fast, trusted service for every major brand — with genuine parts and
          transparent pricing.
        </p>
      </div>

      <div className="text-center mb-4 d-block d-md-none">
        <BookServiceButton />
      </div>

      <div className="row g-4">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            className="col-md-6 col-lg-4 col-xl-3"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.45, delay: index * 0.06 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="lux-service-card"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <div className="lux-service-card__icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-5 pt-3 d-none d-md-block">
        <BookServiceButton />
      </div>
    </div>
  );
};

export default Services;
