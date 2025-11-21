import ttsService from "../services/ttsServiceInstance.js";

export const speak = async (req, res) => {
    try {
        const { text } = req.body;
        const audioUrl = await ttsService.generateAudio(text);
        res.json({ audioUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "TTS failed" });
    }
};