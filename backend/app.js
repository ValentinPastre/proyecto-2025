import express from "express";
import cors from "cors";
import bcryptLib from "bcryptjs";
import jwtLib from "jsonwebtoken";
import axios from "axios";

//adapters
import BcryptAdapter from "./adapters/BcryptAdapter.js";
import JwtAdapter from "./adapters/JwtAdapter.js";
import AxiosHttpClient from "./http/AxiosHttpClient.js";

// db
import db from "./db/sqlite.js";
import { runMigrations } from "./db/migrations.js";

// repositories
import UserRepository from "./repositories/UserRepository.js";

// services
import AuthService from "./services/AuthService.js";
import TTSService from "./services/TTSService.js";
import CaptionService from "./services/CaptionService.js";
import OrchestratorService from "./services/OrchestratorService.js";

//controllers
import AuthController from "./controllers/AuthController.js";
import TtsController from "./controllers/TtsController.js";
import CaptionController from "./controllers/CaptionController.js";
import OrchestratorController from "./controllers/OrchestratorController.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import ttsRoutes from "./routes/ttsRoutes.js";
import captionRoutes from "./routes/captionRoutes.js";
import orchestratorRoutes from "./routes/orchestratorRoutes.js";
import voiceRoutes from './routes/voice.js';

export function buildApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Adapters
    const passwordHasher = new BcryptAdapter(bcryptLib, 10);
    const jwtAdapter = new JwtAdapter(jwtLib, process.env.JWT_SECRET, "1d");
    const http = new AxiosHttpClient(axios);

    // repositories
    const userRepository = new UserRepository(db);

    // Services
    const authService = new AuthService(userRepository, passwordHasher, jwtAdapter);

    const ttsService = new TTSService(http, process.env.TTS_API_URL);
    const captionService = new CaptionService(http, process.env.CAPTION_API_URL);
    const orchestratorService = new OrchestratorService(captionService, ttsService);

    // Controllers
    const authController = new AuthController(authService);
    const ttsController = new TtsController(ttsService);
    const captionController = new CaptionController(captionService);
    const orchestratorController = new OrchestratorController(orchestratorService);

    runMigrations();

    // routes
    app.use("/api/auth", authRoutes(authController));
    app.use("/api/tts", ttsRoutes(ttsController));
    app.use("/api/caption", captionRoutes(captionController));
    app.use("/api/process", orchestratorRoutes(orchestratorController));
    app.use('/api/voice', voiceRoutes);

    return app;
}
