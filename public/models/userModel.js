// Every function here is a plain SQL query — no ORM. That keeps
// the data layer easy to read, easy to explain in a viva, and
// easy to extend later (e.g. adding a "findRegisteredEvents" query
// once Part 3 builds registrations).

const pool = require('../config/db');

const UserModel = {
  async create({ fullName, email, hashedPassword }) {
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [fullName, email, hashedPassword]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, created_at FROM users WHERE user_id = ?',
      [id]
    );
    return rows[0];
  }
};

module.exports = UserModel;
