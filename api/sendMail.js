const mailer = require("nodemailer");

module.exports = async (email, subject, text) => {
  try {
    const transporter = mailer.createTransport({
      service: "gmail",
      auth: {
        user: "meetingappuni@gmail.com",
        pass: process.env.Email_PASS,
      },
    });
    await transporter.sendMail({
      from: "meetingappuni@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email send successfully");
  } catch (error) {
    console.log(error, "Email not sent");
  }
};
