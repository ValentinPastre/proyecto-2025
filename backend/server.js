import express from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const app = express();
app.use(cors());

// multer para manejar imágenes
const upload = multer({ dest: "uploads/" });

// BLIP API URL
// URL de fallback correcta
const CAPTION_API_URL = process.env.CAPTION_API_URL || "http://captioning:3000/caption";

// Multer espera el campo "file" 
app.post("/api/caption", upload.single("file"), async (req, res) => {
    let imgPath; // Definir imgPath aquí para usarlo en finally
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file received" });
        }

        imgPath = req.file.path; // Asignar el path

        const formData = new FormData();
        formData.append("file", fs.createReadStream(imgPath));

        const response = await axios.post(CAPTION_API_URL, formData, {
            headers: formData.getHeaders(),
        });

        //  Definir la variable 'captionText' 
        const captionText = response.data.caption;

        // Borrar archivo temporal después de usarlo
        fs.unlinkSync(imgPath); 
        imgPath = null; // Marcar como borrado

        const ttsResponse = await axios.post(process.env.TTS_API_URL, {
            text: captionText,
            voice: "bm_fable",
            speed: 1.0
        });

        return res.json({
            objects: response.data.caption,
            audioUrl: ttsResponse.data.audio_url
        });

    } catch (err) {
        console.error("Error in /api/caption:", err);
        return res.status(500).json({ error: "Captioning/TTS failed" });

    } finally {
        // Asegurarse de borrar el archivo si hubo un error antes
        if (imgPath) {
            fs.unlink(imgPath, (err) => {
                if (err) console.error("Error deleting temp file in finally:", err);
            });
        }
    }
});

app.listen(3000, () => console.log("Backend running on port 3000"));