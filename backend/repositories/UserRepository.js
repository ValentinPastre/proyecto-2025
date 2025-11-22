export default class UserRepository {
    constructor(db) {
        this.db = db;
    }

    findByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });
    }

    create({ email, password }) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "INSERT INTO users (email, password) VALUES (?, ?)",
                [email, password],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, email, password });
                }
            );
        });
    }
}