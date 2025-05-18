const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const uploadDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, PNG, and GIF files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

const galleryFile = path.join(__dirname, "gallery.json");
if (!fs.existsSync(galleryFile)) {
  fs.writeFileSync(galleryFile, JSON.stringify({ images: [] }));
}

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on server start
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer transporter error:", error);
  } else {
    console.log("Nodemailer transporter is ready to send emails");
  }
});

// Send test email on startup (non-production only)
if (process.env.NODE_ENV !== "production" && process.env.EMAIL_USER && process.env.BUSINESS_EMAIL) {
  const testMailOptions = {
    from: `"Henna Art" <${process.env.EMAIL_USER}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: "Test Email from Henna Art Server",
    text: "This is a test email sent on server startup to verify Nodemailer configuration.",
  };
  transporter.sendMail(testMailOptions, (error, info) => {
    if (error) {
      console.error("Test email failed:", error);
    } else {
      console.log("Test email sent successfully, message ID:", info.messageId);
    }
  });
}

// Contact form endpoint
app.post("/send-message", async (req, res) => {
  console.log("Message endpoint called with body:", req.body);
  try {
    const { name: contactName, email, message } = req.body;

    // Validate inputs
    if (!contactName || !email || !message) {
      console.log("Missing required fields:", { contactName, email, message });
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.BUSINESS_EMAIL) {
      console.error("Missing email configuration:", {
        EMAIL_USER: !!process.env.EMAIL_USER,
        BUSINESS_EMAIL: !!process.env.BUSINESS_EMAIL,
      });
      return res.status(500).json({
        success: false,
        message: "Server email configuration error",
      });
    }

    const mailOptions = {
      from: `"Henna Art" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL,
      replyTo: email,
      subject: `New Contact Message from ${contactName}`,
      text: `
        Name: ${contactName}
        Email: ${email}
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully, message ID:", info.messageId);

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending message:", error, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: `Failed to send message: ${error.message}`,
    });
  }
});

// Booking submission endpoint
app.post("/submit-booking", async (req, res) => {
  console.log("Booking endpoint called with body:", req.body);
  try {
    const { name: bookingName, email, date, service, notes } = req.body;

    // Validate inputs
    if (!bookingName || !email || !date || !service) {
      console.log("Missing required fields:", { bookingName, email, date, service });
      return res.status(400).json({
        success: false,
        message: "Name, email, date, and service are required",
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Validate date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(selectedDate) || selectedDate < today) {
      console.log("Invalid or past date:", date);
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date",
      });
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.BUSINESS_EMAIL) {
      console.error("Missing email configuration:", {
        EMAIL_USER: !!process.env.EMAIL_USER,
        BUSINESS_EMAIL: !!process.env.BUSINESS_EMAIL,
      });
      return res.status(500).json({
        success: false,
        message: "Server email configuration error",
      });
    }

    const mailOptions = {
      from: `"Henna Art" <${process.env.EMAIL_USER}>`,
      to: process.env.BUSINESS_EMAIL,
      replyTo: email,
      subject: `New Booking Request from ${bookingName}`,
      text: `
        Booking Details:
        Name: ${bookingName}
        Email: ${email}
        Date: ${date}
        Service: ${service}
        Notes: ${notes || "None provided"}
      `,
      html: `
        <h3>New Booking Request</h3>
        <p><strong>Name:</strong> ${bookingName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Additional Notes:</strong> ${notes || "None provided"}</p>
      `,
    };

    console.log("Sending booking email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });
    const info = await transporter.sendMail(mailOptions);
    console.log("Booking email sent successfully, message ID:", info.messageId);

    res.json({ success: true, message: "Booking submitted successfully!" });
  } catch (error) {
    console.error("Error submitting booking:", error, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: `Failed to submit booking: ${error.message}`,
    });
  }
});

// Image upload endpoint
app.post("/upload-image", (req, res) => {
  console.log("Upload endpoint called");
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log("Multer error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      console.log("File upload error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
    console.log("Received upload request at:", new Date().toISOString());
    if (!req.file) {
      console.log("No file uploaded or invalid file type");
      return res.status(400).json({
        success: false,
        message: "No file uploaded or invalid file type",
      });
    }

    console.log("Uploaded file:", req.file.filename);
    console.log("Saving uploaded file to:", path.join(uploadDir, req.file.filename));
    try {
      console.log("Reading gallery.json from:", galleryFile);
      let galleryData = { images: [] };

      if (fs.existsSync(galleryFile)) {
        const fileContent = fs.readFileSync(galleryFile, "utf8").trim();
        if (fileContent) {
          try {
            galleryData = JSON.parse(fileContent);
            if (!galleryData.images || !Array.isArray(galleryData.images)) {
              galleryData = { images: [] };
            }
          } catch (parseError) {
            console.error("Error parsing gallery.json:", parseError);
            galleryData = { images: [] };
          }
        }
      }

      console.log("Current gallery data:", galleryData);
      galleryData.images.push(req.file.filename);
      console.log("Writing updated gallery data:", galleryData);
      fs.writeFileSync(galleryFile, JSON.stringify(galleryData, null, 2));
      console.log("Successfully wrote to gallery.json");
      res.json({ success: true, message: "Image uploaded successfully" });
    } catch (error) {
      console.error("Error updating gallery metadata:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update gallery metadata: " + error.message,
      });
    }
  });
});

// Get gallery endpoint
app.get("/get-gallery", (req, res) => {
  try {
    if (!fs.existsSync(galleryFile)) {
      return res.json({ success: true, images: [] });
    }
    const content = fs.readFileSync(galleryFile, "utf8");
    const galleryData = JSON.parse(content);
    res.json({ success: true, images: galleryData.images });
  } catch (error) {
    console.error("Error reading gallery metadata:", error);
    res.status(500).json({ success: false, message: "Failed to load gallery" });
  }
});

// Serve uploaded images and static files
app.use("/uploads", express.static(uploadDir, { maxAge: 0 }));
app.use(express.static(__dirname));

// Delete image endpoint
app.delete("/delete-image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(uploadDir, filename);

  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    let galleryData = { images: [] };
    if (fs.existsSync(galleryFile)) {
      const fileContent = fs.readFileSync(galleryFile, "utf8").trim();
      if (fileContent) {
        galleryData = JSON.parse(fileContent);
      }
    }
    galleryData.images = galleryData.images.filter((img) => img !== filename);
    fs.writeFileSync(galleryFile, JSON.stringify(galleryData, null, 2));
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Upload directory: ${uploadDir}`);
  console.log(`Gallery metadata file: ${galleryFile}`);
});