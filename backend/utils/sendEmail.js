import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    console.log("✅ Resend response:", response);
  } catch (err) {
    console.error("❌ Resend error:", err);
  }
};

export default sendEmail;
