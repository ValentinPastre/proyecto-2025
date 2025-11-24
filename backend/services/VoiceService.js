export class VoiceService {
    constructor() {
        this.whisperApiUrl = process.env.WHISPER_API_URL || 'http://localhost:5000/api';
    }

    async transcribeAudio(audioBuffer) {
        try {
            //color aca la integracion con el whisper fine-tuneado
            return "comando de ejemplo transcrito";
        } catch (error) {
            throw new Error(`Transcription failed: ${error.message}`);
        }
    }

    async interpretCommand(text) {
        const lowerText = text.toLowerCase();
        
        const commandPatterns = [
            {
                pattern: /(login|inicio|entrar|ingresar)/,
                action: 'navigate_login'
            },
            {
                pattern: /(registro|registrar|crear cuenta)/,
                action: 'navigate_register'
            },
            {
                pattern: /(cámara|camara|visión|vision)/,
                action: 'navigate_camera'
            },
            {
                pattern: /escribir\s+(.+?)\s+en\s+(email|correo)/,
                action: 'fill_email',
                extract: (match) => ({ value: match[1] })
            },
            //agregar mas comandos de voz si hace falta
        ];

        for (const pattern of commandPatterns) {
            const match = lowerText.match(pattern.pattern);
            if (match) {
                return {
                    action: pattern.action,
                    parameters: pattern.extract ? pattern.extract(match) : {},
                    confidence: 0.95,
                    originalText: text
                };
            }
        }

        return {
            action: 'unknown',
            parameters: {},
            confidence: 0,
            originalText: text
        };
    }
}
