export default class CaptionController {
    constructor (captionService) {
        this.captionService = captionService;
    }

    async handleCaptionRequest(req, res) {
        try{
            const imagePath = req.file.path;

            const caption = await this.captionService.generateCaption(imagePath);

            res.json({ caption });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}