import { Router } from "express";
import multer from "multer";

export default function captionRoutes(captionController) {
    const router = Router();
    const upload = multer({ dest: "uploads/" });

    router.post("/", upload.single("file"), captionController.handleCaption.bind(captionController));

    return router;
}