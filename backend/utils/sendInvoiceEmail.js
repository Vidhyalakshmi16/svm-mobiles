import { Resend } from "resend";
import fs from "fs";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendInvoiceEmail = async ({ to, subject, html, pdfPath }) => {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);

    await resend.emails.send({
      from: "Sri Vaari Mobiles <onboarding@resend.dev>",
      to,
      subject,
      html,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
        },
      ],
    });

    console.log("✅ Invoice email sent to:", to);

    // Optional cleanup
    // fs.unlinkSync(pdfPath);

  } catch (err) {
    console.error("❌ Invoice email failed:", err);
  }
};

export default sendInvoiceEmail;
