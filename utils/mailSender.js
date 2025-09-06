const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // Create reusable transporter
//     console.log("MAIL_HOST:", process.env.MAIL_HOST);
// console.log("MAIL_USER:", process.env.MAIL_USER);
// console.log("MAIL_PASS length:", process.env.MAIL_PASS?.length);

    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587, // secure:false for TLS
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Send email
    let info = await transporter.sendMail({
      from: `"UpCode || UpCode--By Preet" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("📧 Mail sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail sending failed:", error.message);
    throw new Error(error.message);
  }
};

module.exports = mailSender;
