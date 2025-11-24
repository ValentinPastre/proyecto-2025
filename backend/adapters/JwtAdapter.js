export default class JwtAdapter {
    constructor(jwt, secret, expiresIn = "1d") {
        this.jwt = jwt;
        this.secret = secret;
        this.expiresIn = expiresIn;
    }

    generateToken(payload) {
        return this.jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }

    verifyToken(token) {
        return this.jwt.verify(token, this.secret);
    }
}