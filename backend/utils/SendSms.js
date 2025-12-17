import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSms = async ({ to, message }) => {
  if (!to || !message) return;

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE, // your Twilio number
      to: to.startsWith("+") ? to : `+91${to}`,
    });
  } catch (err) {
    console.error("SMS send failed:", err.message);
  }
};

export default sendSms;
