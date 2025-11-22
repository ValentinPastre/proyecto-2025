import db from "./sqlite.js";

export function runMigrations() {
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL        
        );
    `;

    db.run(usersTable, (err) => {
        if (err) {
            console.error("Migration error:", err);
        } else {
            console.log("Users table created.");
        }
    });
}  