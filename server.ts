import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API route for booking
  app.post("/api/book", async (req, res) => {
    const { fullName, phoneNumber, service, date, time, message } = req.body || {};

    if (!fullName || !phoneNumber || !service || !date) {
      return res.status(400).json({ error: "Required fields are missing: fullName, phoneNumber, service, date." });
    }

    const emailUser = process.env.EMAIL_USER || "ranichame.makeupartist@gmail.com";
    const emailPassRaw = process.env.EMAIL_PASS || "xaik shci oexf yrfv";
    const emailPass = emailPassRaw.replace(/\s+/g, ""); // strip spaces for Google App Password standard compatibility

    if (!emailUser || !emailPass) {
      console.error("Missing EMAIL_USER or EMAIL_PASS configuration.");
      return res.status(500).json({
        error: "Backend mail setup issue: EMAIL_USER or EMAIL_PASS is not configured."
      });
    }

    // Create a transporter
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
      res.status(200).json({ message: "Booking request sent successfully!" });
    } catch (error: any) {
      console.error("Error sending email:", error);
      
      const errorMessage = error?.message || "";
      if (error?.code === 'EAUTH' || errorMessage.includes('535-5.7.8') || errorMessage.includes('Username and Password not accepted')) {
        res.status(500).json({
          error: "Gmail authentication failed. You MUST use a 16-character 'App Password' from Google, NOT your regular password. Enable 2-step verification, then select App Passwords to create one."
        });
      } else {
        res.status(500).json({ error: "Failed to send booking request email. Adjust your credentials or contact via WhatsApp." });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
