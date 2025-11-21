import captioningService from "../services/captionServiceInstance.js";
import fs from "fs";

export const captionImage = async (req, res) => {

    try{
        const imagePath = req.file.path;

        const caption = await this.captionService.generateCaption(imagePath);

        fs.unlinkSync(imagePath);
        res.json({ caption });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
