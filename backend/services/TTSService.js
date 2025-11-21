import axios from "axios";

export default class TTSService {
    constructor(ttsUrl) {
        this.ttsUrl = ttsUrl;
    }

    async generateAudio(text) {
        const ttsResponse = await axios.post(
            `${this.ttsUrl}/speak`, {
            voice: "bm_fable",
            speed: 1.0
        });

        return ttsResponse.data.audioUrl;
    }
}