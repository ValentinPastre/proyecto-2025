import express from 'express';
import multer from 'multer';
import { VoiceService } from '../services/VoiceService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/voice/transcribe
 * Transcribe audio usando Whisper
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No audio file received' 
            });
        }

        const voiceService = new VoiceService();
        const transcription = await voiceService.transcribeAudio(req.file.buffer);

        res.json({
            success: true,
            text: transcription,
            language: 'es-AR'
        });

    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/voice/command
 * Interpreta comandos de texto
 */
router.post('/command', express.json(), async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ 
                success: false,
                error: 'No text provided' 
            });
        }

        const voiceService = new VoiceService();
        const command = await voiceService.interpretCommand(text);

        res.json({
            success: true,
            command: command
        });

    } catch (error) {
        console.error('Command interpretation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/voice/health
 * Health check para el servicio de voz
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'active',
        service: 'voice-recognition',
        timestamp: new Date().toISOString()
    });
});

export default router;