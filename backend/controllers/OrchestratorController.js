import fs from "fs";

export class OrchestratorController {
    constructor(captionService, ttsService) {
        this.captionService = captionService;
        this.ttsService = ttsService;
    }

    async processImage(req, res) {
        let filePath = null;

        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file received" });
            }

            filePath = req.file.path;

            // Obtener caption
            const captionText = await this.captionService.getCaption(filePath);

            // Obtener audio desde TTS
            const audioUrl = await this.ttsService.synthesize(captionText);

            // Respuesta
            return res.json({
                objects: captionText,
                audioUrl
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Captioning/TTS failed" });

        } finally {
            if (filePath) {
                fs.unlink(filePath, () => {});
            }
        }
    }
}
