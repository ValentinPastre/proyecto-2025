export class AuthController{
    constructor(authService) {
        this.authService = authService;
    }

    async register(req, res) {
        try {
            const email = req.file.email;
            const password = req.file.password;
            const result = await this.authService.register({ email, password });
            res.status(201).json(result); //succesfull creation
        } catch (err) {
            res.status(400).json({ error: "Authentication failed" });
        }
    }

    async login(req, res) {
        try {
            const email = req.file.email;
            const password = req.file.password;
            const token = await this.authService.login({ email, password });
            res.json({ token });
        } catch (err) {
            res.status(400).json({ error: "Login failed" });
        }
    }
}