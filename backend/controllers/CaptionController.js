import fs from "fs";

export default class CaptionController {
    constructor(captionService) {
        this.captionService = captionService;
    }


    async handleCaption(req, res) {
        try {
            const imagePath = req.file.path;

            const caption = await this.captionService.generateCaption(imagePath);

            fs.unlinkSync(imagePath);  

            return res.json({ caption });
        } catch (err) {
            console.error("Login error", err);
            return res.status(500).json({ error: err.message });
        }
    }
}