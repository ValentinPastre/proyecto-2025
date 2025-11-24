import axios from 'axios';
import FormData from 'form-data';

export class VoiceService {
    constructor() {
        this.whisperApiUrl = process.env.WHISPER_API_URL || 'http://speech-to-text:5000';
    }

    async transcribeAudio(audioBuffer) {
        try {
            const formData = new FormData();
            formData.append('file', audioBuffer, {
                filename: 'audio.webm',
                contentType: 'audio/webm',
            });

            console.log(`Enviando audio a: ${this.whisperApiUrl}/transcribe`);

            const response = await axios.post(`${this.whisperApiUrl}/transcribe`, formData, {
                headers: {
                    ...formData.getHeaders(), 
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });

            return response.data.text || response.data.transcription;

        } catch (error) {
            console.error('Error en VoiceService:', error.message);
            if (error.response) {
                console.error('Detalle del error remoto:', error.response.data);
            }
            throw new Error(`Fallo en transcripción: ${error.message}`);
        }
    }

    async interpretCommand(text) {
        if (!text) return { action: 'unknown', confidence: 0, originalText: '' };
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
            }
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