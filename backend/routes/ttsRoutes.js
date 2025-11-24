import { Router } from "express";

export default function ttsRoutes(ttsController) {
    const router = Router();

    router.post("/", ttsController.speak.bind(ttsController));

    return router;
}