const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database('hireconnect.db');
db.pragma('foreign_keys = ON');

const pool = {
    query: async (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('SHOW')) {
                const rows = stmt.all(...params);
                return [rows];
            } else {
                const result = stmt.run(...params);
                return [{ insertId: result.lastInsertRowID, affectedRows: result.changes }];
            }
        } catch (error) {
            console.error('Query error:', error.message);
            throw error;
        }
    },
    getConnection: async () => {
        return {
            beginTransaction: async () => {},
            commit: async () => {},
            rollback: async () => {},
            release: () => {},
            query: async (sql, params) => {
                const stmt = db.prepare(sql);
                if (sql.trim().toUpperCase().startsWith('SELECT')) {
                    const rows = stmt.all(...params);
                    return [rows];
                } else {
                    const result = stmt.run(...params);
                    return [{ insertId: result.lastInsertRowID, affectedRows: result.changes }];
                }
            }
        };
    }
};

async function initializeDatabase() {
    try {
        const stmt = db.prepare('SELECT 1 as health');
        stmt.get();
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
}

module.exports = { pool, initializeDatabase, db };
