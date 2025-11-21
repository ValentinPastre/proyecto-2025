import axios from "axios";
import fs from "fs";

export default class CaptionService {
    constructor(captionURL) {
        this.captionURL = captionURL;
    }

    async generateCaption(imagePath) {
        const imageBuffer = fs.readFileSync(imagePath);

        const form = new FormData();
        form.append("image", imageBuffer, "image.jpg");

        const response = await axios.post(`${this.captionURL}/caption`, form, {
            headers: form.getHeaders(),
        });

        return response.data.caption;
    }

}