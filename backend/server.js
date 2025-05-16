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

app.post("/upload-image", (req, res) => {
  console.log("Upload endpoint called"); // Debug
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

app.use("/uploads", express.static(uploadDir, { maxAge: 0 }));
app.use(express.static(__dirname));

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Upload directory: ${uploadDir}`);
  console.log(`Gallery metadata file: ${galleryFile}`);
});