export default class AuthService {
    constructor(userRepository, passwordHasher, tokenManager) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenManager = tokenManager;
    }

    async register(email, password) {
        console.log("passwordHasher es:", this.passwordHasher);

        const existing = await this.userRepository.findByEmail(email)
        if (existing) throw new Error("Email already registered");

        const hashed = await this.passwordHasher.hashPassword(password);

        const user = await this.userRepository.create({
            email,
            password: hashed
        });

        return { id: user.id, email: user.email };
    }

    async login(email, password) {
        const user = await this.userRepository.findByEmail(email)
        if (!user) throw new Error("Email is not registered");
        
        const match = await this.passwordHasher.comparePassword(password, user.password);
        if (!match) throw new Error("Passwords don't match");

        const token = this.tokenManager.generateToken({ id: user.id });

        return token;
    }
}