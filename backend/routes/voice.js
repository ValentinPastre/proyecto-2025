import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configurar multer para almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});

/**
 * POST /api/voice/process
 * Procesa audio y devuelve el texto transcrito
 * (Preparado para integración con Whisper u otro servicio)
 */
router.post('/process', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió archivo de audio' });
        }

        console.log('Audio recibido:', {
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        // Aquí puedes integrar con servicios de transcripción como:
        // - OpenAI Whisper API
        // - Google Speech-to-Text
        // - Azure Speech Services
        
        // Por ahora devolvemos un mock
        const mockTranscription = "capturar";

        res.json({
            success: true,
            transcript: mockTranscription,
            confidence: 0.95,
            language: 'es-AR'
        });

    } catch (error) {
        console.error('Error procesando audio:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/voice/command
 * Interpreta un comando de texto y devuelve acciones estructuradas
 */
router.post('/command', express.json(), async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No se recibió texto' });
        }

        console.log('Procesando comando:', text);

        const action = interpretarComando(text.toLowerCase());

        res.json({
            success: true,
            originalText: text,
            action: action
        });

    } catch (error) {
        console.error('Error interpretando comando:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/voice/commands
 * Devuelve lista de comandos disponibles para Visión Asistida
 */
router.get('/commands', (req, res) => {
    const comandos = [
        {
            pattern: 'escribir {texto} en email',
            action: 'fill_email',
            description: 'Escribir email en login/registro'
        },
        {
            pattern: 'escribir {texto} en contraseña',
            action: 'fill_password',
            description: 'Escribir contraseña'
        },
        {
            pattern: 'entrar / iniciar sesión',
            action: 'login',
            description: 'Iniciar sesión'
        },
        {
            pattern: 'registrarse / crear cuenta',
            action: 'register',
            description: 'Crear nueva cuenta'
        },
        {
            pattern: 'capturar / foto / tomar foto',
            action: 'capture',
            description: 'Capturar imagen con cámara'
        },
        {
            pattern: 'subir imagen',
            action: 'upload',
            description: 'Subir imagen desde archivo'
        },
        {
            pattern: 'repetir',
            action: 'replay_audio',
            description: 'Reproducir audio nuevamente'
        },
        {
            pattern: 'cerrar sesión',
            action: 'logout',
            description: 'Cerrar sesión'
        }
    ];

    res.json({
        success: true,
        commands: comandos,
        total: comandos.length
    });
});

/**
 * Función auxiliar para interpretar comandos específicos de Visión Asistida
 */
function interpretarComando(texto) {
    // Comandos de cámara
    if (texto.includes('capturar') || texto.includes('foto') || texto.includes('tomar foto')) {
        return {
            type: 'capture',
            params: {}
        };
    }

    if (texto.includes('subir imagen') || texto.includes('subir archivo')) {
        return {
            type: 'upload',
            params: {}
        };
    }

    // Comandos de autenticación
    const emailMatch = texto.match(/escribir (.+) en email/);
    if (emailMatch) {
        return {
            type: 'fill_email',
            params: { text: emailMatch[1].trim() }
        };
    }

    const passwordMatch = texto.match(/escribir (.+) en (contraseña|password)/);
    if (passwordMatch) {
        return {
            type: 'fill_password',
            params: { text: passwordMatch[1].trim() }
        };
    }

    if (texto.includes('entrar') || texto.includes('iniciar sesión')) {
        return {
            type: 'login',
            params: {}
        };
    }

    if (texto.includes('registrarse') || texto.includes('crear cuenta')) {
        return {
            type: 'register',
            params: {}
        };
    }

    if (texto.includes('cerrar sesión')) {
        return {
            type: 'logout',
            params: {}
        };
    }

    // Comandos de audio
    if (texto.includes('repetir')) {
        return {
            type: 'replay_audio',
            params: {}
        };
    }

    if (texto.includes('pausar')) {
        return {
            type: 'pause_audio',
            params: {}
        };
    }

    // Limpiar campos
    if (texto.includes('limpiar')) {
        return {
            type: 'clear_form',
            params: {}
        };
    }

    // Comando no reconocido
    return {
        type: 'unknown',
        params: { originalText: texto }
    };
}

export default router;