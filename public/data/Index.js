/**
 * public/data/index.js (ESM version)
 *
 * A minimal Node/Express server to:
 * 1) Receive file uploads at POST /api/extract-colors
 * 2) Save the uploaded file as logo.png in same dir as color_extractor.py
 * 3) Spawn color_extractor.py
 * 4) Return { color_combos: [] } etc.
 */
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

app.use(cors());

// temp folder for multer
const upload = multer({ dest: "uploads/" });

app.post("/api/extract-colors", upload.single("logo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Move from 'uploads' to 'logo.png'
    const tempPath = req.file.path;
    const scriptDir = __dirname; // e.g. .../public/data
    const logoPath = path.join(scriptDir, "logo.png");

    fs.rename(tempPath, logoPath, (err) => {
      if (err) {
        console.error("Error moving file:", err);
        return res.status(500).json({ error: "Failed to move file." });
      }

      // color_extractor.py
      const pyScript = path.join(scriptDir, "color_extractor.py");
      // If your system needs 'python3':
      const pyProcess = spawn("python", [pyScript]);

      pyProcess.stderr.on("data", (data) => {
        console.error(`Python stderr: ${data}`);
      });

      pyProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`color_extractor.py exited with code ${code}`);
          return res
            .status(500)
            .json({ error: "color_extractor script failed." });
        }

        // color_extractor writes 'extracted_data.json'
        const extractedPath = path.join(scriptDir, "extracted_data.json");
        if (!fs.existsSync(extractedPath)) {
          return res
            .status(500)
            .json({ error: "extracted_data.json not found after extraction." });
        }

        fs.readFile(extractedPath, "utf-8", (err, content) => {
          if (err) {
            console.error("Error reading extracted_data.json:", err);
            return res
              .status(500)
              .json({ error: "Failed to read extracted data." });
          }

          const parsed = JSON.parse(content);
          return res.json({
            color_combos: parsed.color_combos || [],
            palette: parsed.palette || [],
            dominant: parsed.dominant || "",
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in /api/extract-colors:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Node (ESM) server in public/data/index.js running on port ${PORT}`);
});
