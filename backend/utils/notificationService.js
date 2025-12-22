import sendEmail from "./sendEmail.js";
import sendSms from "./message.js";

/**
 * Central notification handler
 * You can call only what you need (email / sms / both)
 */
const notify = async ({
  email,        // string | undefined
  phone,        // string | undefined
  emailSubject, // string
  emailHtml,    // string
  smsMessage,   // string
}) => {
  try {
    // Send Email
    if (email && emailSubject && emailHtml) {
      await sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });
    }

    // Send SMS
    if (phone && smsMessage) {
      await sendSms({
        to: phone,
        message: smsMessage,
      });
    }
  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
};

export default notify;
