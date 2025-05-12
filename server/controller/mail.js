require('dotenv').config(); // Load environment variables
const nodemailer = require('nodemailer');
const users = require("../models/users");

function generateOTP() {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
  }
  return otp;
}

async function verifyemial(req, res) {
  const Uemail = req.body.email;
  const query = { email: Uemail };
  const OTP = generateOTP();

  try {
    const existingUser = await users.findOne(query); // Use findOne, not find

    if (existingUser) {
      console.log("User already exists:", existingUser.username);
      return res.json({ allow: false }); // User exists, don't send email
    } else {
      console.log("User not found, sending email with OTP");

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Set to true for port 465, false for others
        auth: {
          user: "xyz@gmail.com", // Use environment variable for email
          pass: "password", // Use environment variable for app password
        },
      });

      const mailOptions = {
        from: `"MyApp" samanox146@gmail.com`, // Correct sender format
        to: Uemail, // Recipient address (from the request)
        subject: 'Welcome to MyApp!', // Subject of the email
        text: 'Thank you for registering with WhiteBoard! opt :' + OTP + '', // Plain text body
        html: '<p>Thank you for registering with <strong>WhiteBoard</strong>! opt :' + OTP + '</p>', // HTML body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send('Error sending email: ' + error.message);
        }
        res.json({ allow: true, opt: OTP });
      });
    }
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).send("Internal server error"); // Handle errors gracefully
  }
}

module.exports = verifyemial;
