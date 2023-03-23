const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Define some options
  const mailOptions = {
    from: "Stephen Afari< hello@Afari.io",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  transporter.sendMail(mailOptions);
};

module.exports = sendEmail;