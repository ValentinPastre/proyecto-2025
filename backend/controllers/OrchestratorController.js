import fs from "fs";

export default class OrchestratorController {
    constructor(orchestratorService) {
        this.orchestratorService = orchestratorService;
    }

    handle = async (req, res) => {
        let imgPath = req.file.path;

        try {
            const result = await this.orchestratorService.processImage(imgPath);

            fs.unlinkSync(imgPath);

            return res.json({
                caption: result.captionText,
                audioUrl
            });

        } catch (err) {
            console.error("Orchestrator error:", err);
            return res.status(500).json({ error: err.message });
        }
    };
}
