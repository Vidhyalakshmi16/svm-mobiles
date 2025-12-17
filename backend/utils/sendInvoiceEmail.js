import transporter from "../config/mailer.js";
import fs from "fs";

const sendInvoiceEmail = async ({
  to,
  subject,
  html,
  pdfPath,
}) => {
  const mailOptions = {
    from: `"Your Store" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: "invoice.pdf",
        path: pdfPath,
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);

  // optional cleanup later
  // fs.unlinkSync(pdfPath);
};

export default sendInvoiceEmail;
