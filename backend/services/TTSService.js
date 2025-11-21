export default class TTSService {
    constructor(httpClient, ttsUrl) {
        this.httpClient = httpClient;
        this.ttsUrl = ttsUrl;
    }

    async generateAudio(text) {
        try {
            const ttsResponse = await this.httpClient.post(
                `${this.ttsUrl}/speak`, 
                {
                    text,
                    voice: "bm_fable",
                    speed: 1.0
                }
            );

            return ttsResponse.data.audioUrl;

        } catch(err) {
            console.error("TtsService.generateAudio error:", err);
            throw new Error("TTS service failed");
        }
    }
}