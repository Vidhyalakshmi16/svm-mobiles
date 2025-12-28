// src/pages/Contact.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import { submitContactForm } from "../services/api"; // you'll create this API helper
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "",
    preferredContact: "call",
    preferredTime: "",
    message: "",
    allowWhatsApp: true,
  });
  const { user } = useAuth();
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      toast.warn("Please enter your name");
      return false;
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      toast.warn("Please enter a valid mobile number");
      return false;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      toast.warn("Please describe your issue (at least 10 characters)");
      return false;
    }
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔐 LOGIN CHECK (ADD THIS)
  if (!user) {
    toast.info("Please login to submit a service request");
    navigate("/auth", {
      state: { redirectTo: "/contact" },
    });
    return;
  }

  // ✅ FORM VALIDATION
  if (!validate()) return;

  try {
    setLoading(true);
    await submitContactForm(form);

    toast.success("Thank you! We’ll contact you shortly.");

    // Reset form
    setForm({
      name: "",
      phone: "",
      email: "",
      serviceType: "",
      preferredContact: "call",
      preferredTime: "",
      message: "",
      allowWhatsApp: true,
    });
  } catch (err) {
    console.error("Contact form error:", err.response?.data || err.message);
    toast.error(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="container mt-5 pt-4">
      {/* Page header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-2">Contact & Service Request</h2>
        <p className="text-muted mb-0">
          Share your issue with us. We&apos;ll call or WhatsApp you as soon as possible.
        </p>
      </div>

      <div className="row g-4">
        {/* LEFT: Form */}
        <div className="col-lg-7">
          <div className="p-4 rounded-4 shadow-sm bg-white">
            <h5 className="fw-semibold mb-3">Tell us how we can help</h5>

            <form onSubmit={handleSubmit}>

              {/* Name + Phone */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

               {/* Brand + Model */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobile Brand *</label>
                  <select
                    name="mobileBrand"
                    className="form-select"
                    value={form.mobileBrand}
                    onChange={handleChange}
                  >
                    <option value="">Select brand</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Apple">Apple</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Realme">Realme</option>
                    <option value="Redmi">Redmi</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Poco">Poco</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobile Model *</label>
                  <input
                    type="text"
                    name="mobileModel"
                    className="form-control"
                    value={form.mobileModel}
                    onChange={handleChange}
                    placeholder="e.g. Redmi Note 10 Pro"
                  />
                </div>
              </div>

              {/* Service + Contact Preference */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Type of Service</label>
                  <select
                    name="serviceType"
                    className="form-select"
                    value={form.serviceType}
                    onChange={handleChange}
                  >
                    <option value="">Select service type</option>
                    <option value="Mobile Repair">Mobile Repair</option>
                    <option value="New Mobile Enquiry">New Mobile Enquiry</option>
                    <option value="Accessories Enquiry">Accessories Enquiry</option>
                    <option value="Network / Recharge Issue">
                      Network / Recharge Issue
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Preferred Contact</label>
                  <select
                    name="preferredContact"
                    className="form-select"
                    value={form.preferredContact}
                    onChange={handleChange}
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="either">Call or WhatsApp</option>
                  </select>
                </div>
              </div>

              {/* Preferred time */}
              <div className="mb-3">
                <label className="form-label">Preferred Time to Contact</label>
                <select
                  name="preferredTime"
                  className="form-select"
                  value={form.preferredTime}
                  onChange={handleChange}
                >
                  <option value="">Any time</option>
                  <option value="Morning">Morning (9 AM – 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM – 4 PM)</option>
                  <option value="Evening">Evening (4 PM – 8 PM)</option>
                </select>
              </div>

              {/* Message */}
              <div className="mb-3">
                <label className="form-label">Message / Problem description *</label>
                <textarea
                  name="message"
                  className="form-control"
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Example: My phone screen is broken, model, issue details…"
                />
                <small className="text-muted">
                  Minimum 10 characters. Add model name if possible.
                </small>
              </div>

              {/* WhatsApp consent */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="allowWhatsApp"
                  name="allowWhatsApp"
                  checked={form.allowWhatsApp}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="allowWhatsApp">
                  You can contact me on WhatsApp using this number.
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-dark w-100"
                disabled={loading}
              >
                {loading ? "Sending..." : user ? "Submit Request" : "Login to Submit"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Shop info */}
        <div className="col-lg-5">
          <div className="p-4 rounded-4 shadow-sm bg-white mb-3">
            <h5 className="fw-semibold mb-3">Sri Vaari Mobiles</h5>
            <p className="mb-1 text-muted small">Shop Address</p>
            <p className="mb-2">
              296/82, Tvk road, Ammapet,<br />
              Salem, Tamil Nadu – 636003
            </p>

            <p className="mb-1 text-muted small">Contact</p>
            <p className="mb-2">
              Phone / WhatsApp: <strong>+91 87546 74075</strong> {/* adjust if needed */}
            </p>

            <p className="mb-1 text-muted small">Working Hours</p>
            <p className="mb-0">
              <strong>Mon – Sun</strong> : 10:00 AM – 9:30 PM
            </p>
          </div>

          <div className="p-4 rounded-4 shadow-sm bg-white">
            <h6 className="fw-semibold mb-2">Quick Actions</h6>
            <div className="d-flex flex-wrap gap-2">
              <a
                href="tel:+918754674075"
                className="btn btn-outline-dark btn-sm"
              >
                Call Now
              </a>
              <a
                href="https://wa.me/918754674075"
                target="_blank"
                rel="noreferrer"
                className="btn btn-success btn-sm"
              >
                WhatsApp
              </a>
              {/* If you have Google Maps link, put it here */}
              <a
                href="https://maps.app.goo.gl/nD6n1AyyXkDNaxTV7"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary btn-sm"
              >
                Open in Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
