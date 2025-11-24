export default class BcryptAdapter {
    constructor(bcrypt, saltRounds = 10) {
        this.bcrypt = bcrypt;
        this.saltRounds = saltRounds;
    }

    hashPassword(password) {
        return this.bcrypt.hash(password, this.saltRounds);
    }

    comparePassword(password, hashed) {
        return this.bcrypt.compare(password, hashed);
    }
}