import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'content_creator_tracker_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

try {
  const connection = await pool.getConnection();
  console.log("Database connection success");
  connection.release();
} catch (error) {
  console.log('connection failed', error.message)
}

export default pool;