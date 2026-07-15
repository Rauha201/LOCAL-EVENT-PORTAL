// Deliberately a mirror of userModel.js. Managers and users are
// separate tables (see database/schema.sql) so keeping their model
// files parallel — same method names, same shapes — makes the
// codebase predictable: once you understand one, you understand
// the other.

const pool = require('../config/db');

const ManagerModel = {
  async create({ fullName, email, hashedPassword }) {
    const [result] = await pool.query(
      'INSERT INTO managers (full_name, email, password) VALUES (?, ?, ?)',
      [fullName, email, hashedPassword]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM managers WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT manager_id, full_name, email, created_at FROM managers WHERE manager_id = ?',
      [id]
    );
    return rows[0];
  }
};

module.exports = ManagerModel;
