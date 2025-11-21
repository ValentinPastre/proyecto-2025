import fs from "fs";
import FormData from "form-data";

export default class CaptionService {
    constructor(httpClient, captionURL) {
        this.httpClient = httpClient;
        this.captionURL = captionURL;
    }

    async generateCaption(imagePath) {
        try {
            const imageBuffer = fs.createReadStream(imagePath);

            const form = new FormData();
            form.append("file", imageBuffer);

            const response = await this.httpClient.post(`${this.captionURL}`, form, {
                headers: form.getHeaders(),
            });

            return response.data.caption;
        } catch(err) {
            console.error("CaptionService.generateCaption error:", err);
            throw new Error("Caption service failed");
        }
    }
}