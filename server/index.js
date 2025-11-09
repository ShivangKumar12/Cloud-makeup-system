import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { Storage } from "@google-cloud/storage";

dotenv.config();
const app = express();

// Enable CORS with dynamic origin check and console logging
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS origin checked:", origin);
      if (!origin || origin === "http://localhost:8082") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Google Cloud setup
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    private_key: process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);

// Ensure filename has extension; fallback to .jpg
function getFilename(file) {
  let ext = ".jpg";
  if (file.originalname && file.originalname.includes(".")) {
    ext = file.originalname.substring(file.originalname.lastIndexOf("."));
  }
  return `${Date.now()}-upload${ext}`;
}

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("[UPLOAD] No file received");
      return res.status(400).json({ error: "No file received" });
    }

    const filename = getFilename(req.file);
    console.log(`[UPLOAD] Received file, naming as: ${filename}`);

    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("[UPLOAD ERROR] Google Storage write stream error:", err);
      res.status(500).send({ error: err.message });
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      console.log(`[UPLOAD] File uploaded. Public URL: ${publicUrl}`);
      res.status(200).send({ url: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    console.error("[UPLOAD ERROR] Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete route
app.delete("/delete/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    await bucket.file(filename).delete();
    res.send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// List files route
app.get("/files", async (req, res) => {
  try {
    const [files] = await bucket.getFiles();
    const urls = files.map(
      (f) => `https://storage.googleapis.com/${bucket.name}/${f.name}`
    );
    console.log(`[FILES] Returned ${urls.length} files`);
    res.json(urls);
  } catch (err) {
    console.error("[FILES ERROR] Getting files failed:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
