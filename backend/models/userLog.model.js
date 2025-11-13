const pool = require('../config/db');

class UserLog {
  static async create(userId, userAgent, ipAddress) {
    try {
      const [result] = await pool.query(
        'INSERT INTO user_logs (user_id, user_agent, ip_address, login_date) VALUES (?, ?, ?, NOW())',
        [userId, userAgent, ipAddress]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user log:', error);
      throw error;
    }
  }

  static async getLogsByUserId(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user_logs WHERE user_id = ? ORDER BY login_date DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user logs:', error);
      throw error;
    }
  }

  static async getAllLogs() {
    try {
      const [rows] = await pool.query(
        'SELECT ul.*, u.nombre, u.email FROM user_logs ul ' +
        'JOIN usuarios u ON ul.user_id = u.id ' +
        'ORDER BY login_date DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all logs:', error);
      throw error;
    }
  }
}

module.exports = UserLog; 