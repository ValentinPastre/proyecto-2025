import { Router } from "express";
import multer from "multer";

export default function orchestratorRoutes(orchestratorController) {
    const router = Router();
    const upload = multer({ dest: "uploads/" });

    router.post("/", upload.single("file"), orchestratorController.handle.bind(orchestratorController));

    return router;
}
