import express from "express";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

// Importar rutas de voz
import voiceRouter from './routes/voice.js';

const app = express();
app.use(cors());
app.use(express.json());

sqlite3.verbose();
const db = new sqlite3.Database("/app/data/mydb.db");

// Crear tabla users si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Campos incompletos" });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash], function (err) {
      if (err) return res.status(400).json({ message: "Usuario ya existe" });
      return res.json({ message: "Registro exitoso" });
    });
  } catch (err) {
    console.error("Error en /api/register:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Campos incompletos" });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) {
      console.error("Error en /api/login:", err);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
    if (!row) return res.status(400).json({ message: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, row.password);
    if (!valid) return res.status(400).json({ message: "Contraseña incorrecta" });

    return res.json({ message: "Login exitoso" });
  });
});

// ============================================
// RUTA DE CAPTIONING CON TTS
// ============================================

const upload = multer({ dest: "uploads/" });
const CAPTION_API_URL = process.env.CAPTION_API_URL || "http://captioning:3000/caption";

app.post("/api/caption", upload.single("file"), async (req, res) => {
    let imgPath;
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file received" });
        }

        imgPath = req.file.path;

        const formData = new FormData();
        formData.append("file", fs.createReadStream(imgPath));

        const response = await axios.post(CAPTION_API_URL, formData, {
            headers: formData.getHeaders(),
        });

        const captionText = response.data.caption;

        // Borrar archivo temporal
        fs.unlinkSync(imgPath); 
        imgPath = null;

        // Llamar a TTS
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
        if (imgPath) {
            fs.unlink(imgPath, (err) => {
                if (err) console.error("Error deleting temp file:", err);
            });
        }
    }
});

// ============================================
// RUTAS DE CONTROL POR VOZ
// ============================================

app.use('/api/voice', voiceRouter);

// Ruta adicional para convertir texto a voz usando tu TTS existente
app.post('/api/voice/speak', express.json(), async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Texto requerido' });
        }

        // Llamar a tu API de TTS existente
        const ttsResponse = await axios.post(process.env.TTS_API_URL, {
            text: text,
            voice: 'bm_fable',
            speed: 1.0
        });

        // Devolver la URL del audio generado
        return res.json({
            success: true,
            audioUrl: ttsResponse.data.audio_url
        });

    } catch (error) {
        console.error('Error en TTS:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// ============================================
// RUTA DE SALUD
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            backend: 'running',
            captioning: process.env.CAPTION_API_URL || 'http://captioning:3000',
            tts: process.env.TTS_API_URL || 'http://tts:8002',
            voiceControl: 'enabled'
        }
    });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(3000, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   🚀 Visión Asistida - Backend Server         ║
║      con Control de Voz Integrado             ║
║                                                ║
║   Puerto: 3000                                 ║
║   Frontend: http://localhost:8080             ║
║   Backend: http://localhost:3000              ║
║   Captioning: ${process.env.CAPTION_API_URL || 'http://captioning:3000'}
║   TTS: ${process.env.TTS_API_URL || 'http://tts:8002'}
║                                                ║
║   🎤 Rutas de Voz:                            ║
║   - POST /api/voice/process                   ║
║   - POST /api/voice/command                   ║
║   - GET  /api/voice/commands                  ║
║   - POST /api/voice/speak                     ║
╚════════════════════════════════════════════════╝
    `);
});