import { Router } from "express";

export default function authRoutes(AuthController) {
    const router = Router();

    router.post("/register", AuthController.register.bind(AuthController));
    router.post("/login", AuthController.login.bind(AuthController));

    return router;
}