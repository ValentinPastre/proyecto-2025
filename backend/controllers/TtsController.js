export default class TtsController {
    constructor(ttsService) {
        this.ttsService = ttsService;
    }

    async speak(req, res) {
        try {  
            const { text } = req.body;
            const audioUrl = await this.ttsService.generateAudio(text);

            return res.json({ audioUrl });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "TTS failed" });
        }
    }    
}