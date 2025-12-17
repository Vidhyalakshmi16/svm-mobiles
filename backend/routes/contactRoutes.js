// backend/routes/contactRoutes.js
import express from "express";
import ServiceRequest from "../models/ServiceRequest.js";
import { protect } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import sendSms from "../utils/sendSms.js";

const router = express.Router();

/**
 * Helper: build HTML email for service request
 */
const buildServiceRequestHtml = (service) => {
  const createdAt = service.createdAt
    ? new Date(service.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return `
  <div style="font-family: Arial, sans-serif; color:#111827;">
    <h2>Service Request</h2>

    <p>
      <strong>Request ID:</strong> #${String(service._id).slice(-8)}<br/>
      <strong>Status:</strong> ${service.status}<br/>
      <strong>Created:</strong> ${createdAt}
    </p>

    <hr/>

    <h3>Customer Details</h3>
    <p>
      ${service.name}<br/>
      Phone: ${service.phone}<br/>
      Email: ${service.email || "-"}
    </p>

    <h3>Device / Issue</h3>
    <p>
      Device: ${service.mobileBrand || ""} ${service.mobileModel || ""}<br/>
      Issue: ${service.issueType}
    </p>

    ${
      service.message
        ? `<p><strong>Message:</strong> ${service.message}</p>`
        : ""
    }

    <h3>Preferred Schedule</h3>
    <p>
      Date: ${service.preferredDate || "-"}<br/>
      Time: ${service.preferredTime || "-"}
    </p>

    <p style="color:#6b7280;font-size:12px;">
      Our team will contact you shortly.
    </p>
  </div>
  `;
};

/**
 * ✅ POST /api/contact
 * Customer creates service request
 */
router.post("/", protect, async (req, res) => {
  try {
    const service = await ServiceRequest.create({
      user: req.user.userId,
      ...req.body,
      status: "Placed",
    });

    const html = buildServiceRequestHtml(service);

    /* ---------------- EMAIL (non-blocking) ---------------- */
    try {
      if (service.email) {
        await sendEmail({
          to: service.email,
          subject: `Service Request Received – Ref #${String(
            service._id
          ).slice(-8)}`,
          html,
        });
      }

      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `🛠 New Service Request – Ref #${String(
            service._id
          ).slice(-8)}`,
          html,
        });
      }
    } catch (mailErr) {
      console.error("Service email error:", mailErr);
    }

    /* ---------------- CUSTOMER SMS ---------------- */
    try {
      if (service.phone) {
        await sendSms({
          to: service.phone,
          message: `SVM Mobiles: Your service request has been placed successfully. Ref ID: ${String(
            service._id
          ).slice(-8)}. Our team will contact you shortly.`,
        });
      }
    } catch (smsErr) {
      console.error("Customer service SMS error:", smsErr);
    }

    /* ---------------- ADMIN SMS (STEP 4.C) ---------------- */
    try {
      if (process.env.ADMIN_PHONE) {
        await sendSms({
          to: process.env.ADMIN_PHONE,
          message: `SVM Mobiles ADMIN: New service request placed.
Ref: ${String(service._id).slice(-8)}
Customer: ${service.name}
Phone: ${service.phone}`,
        });
      }
    } catch (smsErr) {
      console.error("Admin service placed SMS error:", smsErr);
    }

    res.status(201).json(service);
  } catch (err) {
    console.error("Create service error:", err);
    res
      .status(500)
      .json({ message: "Server error while creating service request" });
  }
});

/**
 * ✅ GET /api/contact/my
 * Customer: view own service requests
 */
router.get("/my", protect, async (req, res) => {
  try {
    const services = await ServiceRequest.find({
      user: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(services);
  } catch (err) {
    console.error("Get my services error:", err);
    res
      .status(500)
      .json({ message: "Server error getting my service requests" });
  }
});

/**
 * ✅ GET /api/contact
 * Admin: view all service requests
 */
router.get("/", protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    const allowed = ["Placed", "In Progress", "Completed", "Cancelled"];
    if (status && allowed.includes(status)) {
      filter.status = status;
    }

    const services = await ServiceRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(services);
  } catch (err) {
    console.error("Get all services error:", err);
    res
      .status(500)
      .json({ message: "Server error getting service requests" });
  }
});

/**
 * ✅ PATCH /api/contact/:id/status
 * Admin updates service status
 */
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const allowed = ["Placed", "In Progress", "Completed", "Cancelled"];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Service request not found" });
    }

    /* ---------------- CUSTOMER EMAIL ---------------- */
    try {
      if (updated.email) {
        await sendEmail({
          to: updated.email,
          subject: `Service Request Status Updated – ${updated.status}`,
          html: buildServiceRequestHtml(updated),
        });
      }
    } catch (mailErr) {
      console.error("Status email error:", mailErr);
    }

    /* ---------------- CUSTOMER SMS ---------------- */
    try {
      if (updated.phone) {
        let smsText = "";

        if (updated.status === "In Progress") {
          smsText =
            "SVM Mobiles: Your service request is now in progress.";
        } else if (updated.status === "Completed") {
          smsText =
            "SVM Mobiles: Your service request has been completed. Thank you!";
        } else if (updated.status === "Cancelled") {
          smsText =
            "SVM Mobiles: Your service request has been cancelled. Please contact us for support.";
        }

        if (smsText) {
          await sendSms({
            to: updated.phone,
            message: smsText,
          });
        }
      }
    } catch (smsErr) {
      console.error("Service status SMS error:", smsErr);
    }

    /* ---------------- ADMIN SMS ON CANCEL (STEP 4.C) ---------------- */
    try {
      if (
        updated.status === "Cancelled" &&
        process.env.ADMIN_PHONE
      ) {
        await sendSms({
          to: process.env.ADMIN_PHONE,
          message: `SVM Mobiles ADMIN: Service request CANCELLED.
Ref: ${String(updated._id).slice(-8)}
Customer: ${updated.name}
Phone: ${updated.phone}`,
        });
      }
    } catch (smsErr) {
      console.error("Admin service cancel SMS error:", smsErr);
    }

    res.json(updated);
  } catch (err) {
    console.error("Update service status error:", err);
    res
      .status(500)
      .json({ message: "Server error updating service status" });
  }
});

export default router;
