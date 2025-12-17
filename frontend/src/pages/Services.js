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
      icon: <FaMobileAlt size={40} className="text-primary" />,
      title: "Screen Replacement",
      desc: "Broken or cracked screen? We replace it with high-quality, genuine displays.",
    },
    {
      icon: <FaBatteryFull size={40} className="text-success" />,
      title: "Battery Replacement",
      desc: "Battery draining fast or not charging? We’ll fix it with a brand-new battery.",
    },
    {
      icon: <FaVolumeUp size={40} className="text-warning" />,
      title: "Speaker / Mic Repair",
      desc: "Can’t hear or speak properly? We’ll fix your speaker or mic in no time.",
    },
    {
      icon: <FaTint size={40} className="text-info" />,
      title: "Water Damage Recovery",
      desc: "Dropped your mobile in water? We’ll dry, clean, and restore it safely.",
    },
    {
      icon: <FaChargingStation size={40} className="text-danger" />,
      title: "Charging Port Repair",
      desc: "Charging issues? We’ll repair or replace your port for smooth charging.",
    },
    {
      icon: <FaCogs size={40} className="text-secondary" />,
      title: "Software & Update Support",
      desc: "Mobile running slow or stuck? We reinstall OS or upgrade firmware fast.",
    },
    {
      icon: <FaCamera size={40} className="text-pink" />,
      title: "Camera Repair",
      desc: "Blurry or dead camera? We’ll replace or clean the camera lens perfectly.",
    },
    {
      icon: <FaDatabase size={40} className="text-dark" />,
      title: "Data Recovery & Backup",
      desc: "Accidentally deleted photos or contacts? We’ll recover them securely.",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container pt-5 mt-5">
      <h2 className="text-center fw-bold mb-3">Our Mobile Repair Services</h2>
      <p className="text-center text-muted mb-5">
        Whatever your phone problem is, we have a reliable solution. Fast, trusted, and affordable service for all brands.
      </p>

      <div className="row g-4">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="col-md-4 col-lg-3"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="card shadow-sm border-0 p-4 text-center rounded-4 h-100"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3">{service.icon}</div>
              <h5 className="fw-semibold">{service.title}</h5>
              <p className="text-muted small">{service.desc}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Button Section */}
      <div className="text-center mt-5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary px-4 py-2 rounded-pill"
          onClick={() => navigate("/contact")} // Change to "/booking" if you create that page
        >
          Book a Service
        </motion.button>
      </div>
    </div>
  );
};

export default Services;
