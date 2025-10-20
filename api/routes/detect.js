import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

router.post("/detect", upload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image received" });

  console.log("File received:", req.file.path);

  const python = spawn("python3", ["detect.py", req.file.path], { stdio: ['pipe','pipe','pipe'] });

  let stdoutData = "";
  let stderrData = "";

  python.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });

  python.stderr.on("data", (data) => {
    stderrData += data.toString();
    console.error("Python stderr:", data.toString());
  });

  python.on("error", (err) => {
    console.error("Error spawning Python process:", err);
  });

  python.on("exit", async (code, signal) => {
    console.log("Python process exited. Code:", code, "Signal:", signal);
    console.log("Attempting to delete uploaded file:", req.file.path);

    console.log("File exists before unlink:", await fs.access(req.file.path).then(() => true).catch(() => false));

    try {
      await fs.unlink(req.file.path);
      console.log("File deleted successfully", req.file.path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    try {
      const lines = stdoutData.trim().split("\n");
      let jsonLine = lines.reverse().find(line => line.startsWith("{"));
      if (!jsonLine) throw new Error("No JSON output from Python");

      const result = JSON.parse(jsonLine);
      res.json(result);
    } catch (err) {
      console.error("Error parsing YOLO output:", err);
      console.log("Raw stdout:", stdoutData);
      console.log("Raw stderr:", stderrData);
      res.status(500).json({ error: "Error parsing YOLO output" });
    }
  });
});

export default router;
