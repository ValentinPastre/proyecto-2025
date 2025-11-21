export class CaptionController {
    constructor(captionService) {
        this.captionService = captionService;
    }


    async handleCaption(req, res) {
        try {
            const imagePath = req.file.path;

            const caption = await this.captionService.caption(imagePath);

            return res.json({ caption });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Captioning failed" });
        }
    }
}