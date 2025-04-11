const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const env = require('../util/config/config.gmail.env');

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  env.ClientID,
  env.client_secret,
  env.redirect_url
);

// Set credentials
oauth2Client.setCredentials({
  refresh_token: env.refresh_token
});

// Send email function
async function sendTextEmail(to, subject, body) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: env.emailId,
        clientId: env.ClientID,
        clientSecret: env.client_secret,
        refreshToken: env.refresh_token,
        accessToken: accessToken.token,
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    const mailOptions = {
      from: env.emailId,
      to: to,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
}

module.exports.sendTextEmail = sendTextEmail;