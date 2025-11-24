export default class AuthController{
    constructor(authService) {
        this.authService = authService;
    }

    async register(req, res) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.register(email, password);
            res.status(201).json(result); //succesfull creation
        } catch (err) {
            console.error("Register error:", err);
            res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const token = await this.authService.login(email, password);
            res.json({ token });
        } catch (err) {
            console.error("Login error:", err);
            res.status(400).json({ error: err.message });
        }
    }
}