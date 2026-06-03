import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { fullName, phoneNumber, service, date, time, message } = req.body || {};

  if (!fullName || !phoneNumber || !service || !date) {
    return res.status(400).json({ error: "Required fields are missing: fullName, phoneNumber, service, date." });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return res.status(500).json({
      error: "EMAIL_USER or EMAIL_PASS environment variables are not configured on Vercel. Please add them in Vin Vercel Project Settings."
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: emailUser,
    to: "ranichame.makeupartist@gmail.com",
    subject: `New Booking Request from ${fullName}`,
    text: `
New Booking Request:
--------------------
Full Name: ${fullName}
Phone Number: ${phoneNumber}
Service: ${service}
Date: ${date}
Time: ${time}
Message: ${message || "No message provided"}
    `,
    html: `
      <h2>New Booking Request</h2>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Message:</strong> ${message || "No message provided"}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Booking request sent successfully!" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    const errorMessage = error?.message || "";
    if (error?.code === "EAUTH" || errorMessage.includes("535-5.7.8") || errorMessage.includes("Username and Password not accepted")) {
      return res.status(500).json({
        error: "Gmail authentication failed. You MUST use a 16-character 'App Password' from Google, NOT your regular password. Enable 2-step verification, then select App Passwords to create one."
      });
    } else {
      return res.status(500).json({ error: "Failed to send booking request email." });
    }
  }
}
