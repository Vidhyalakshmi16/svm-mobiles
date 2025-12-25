import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "Sri Vaari Mobiles <noreply@srivaarimobiles.com>",
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", response.id);
  } catch (err) {
    console.error("❌ Resend email error:", err);
  }
};

export default sendEmail;
