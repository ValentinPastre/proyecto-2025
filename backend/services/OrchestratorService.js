import fs from "fs";
import FormData from "form-data";

export default class OrchestratorService{
    constructor(captionService, ttsService) {
        this.captionService = captionService;
        this.ttsService = ttsService;
    }

    async processImage(imagePath) {
        const captionText = await this.captionService.generateCaption(imagePath);

        const audioUrl = await this.ttsService.generateAudio(captionText);

        return { captionText, audioUrl };
    }
}