import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // admin email
    pass: process.env.MAIL_PASS, // app password
  },
});

export default transporter;
