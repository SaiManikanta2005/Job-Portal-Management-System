import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'career-pulse-secret-key';
const PORT = 3000;

// Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Sai2306@2005',
  // database will be created and connected below
};

let pool: mysql.Pool;

async function initDB() {
  // First connect without database to create it if it doesn't exist
  const connection = await mysql.createConnection(dbConfig);
  await connection.query('CREATE DATABASE IF NOT EXISTS job_portal');
  await connection.end();

  // Now create the pool with the database
  pool = mysql.createPool({
    ...dbConfig,
    database: 'job_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      bio TEXT,
      skills TEXT,
      resume_path VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employer_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      experience VARCHAR(100) NOT NULL,
      salary VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      job_id INT NOT NULL,
      student_id INT NOT NULL,
      status VARCHAR(50) DEFAULT 'PENDING',
      cover_letter TEXT,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      category VARCHAR(100),
      location VARCHAR(255),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      read_status BOOLEAN DEFAULT FALSE,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized and tables verified.');
}

async function startServer() {
  await initDB();
  const app = express();
  app.use(express.json());

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vtu25937@veltech.edu.in',
      pass: 'heqo nfqs jpfc hrtz'
    }
  });

  // Helper to create notifications
  const createNotification = async (userId: number, title: string, message: string) => {
    await pool.query(
      'INSERT INTO notifications (userId, title, message, read_status, date) VALUES (?, ?, ?, false, NOW())',
      [userId, title, message]
    );

    try {
      const [userRows]: any = await pool.query('SELECT email FROM users WHERE id = ?', [userId]);
      if (userRows.length > 0) {
        const userEmail = userRows[0].email;
        await transporter.sendMail({
          from: 'vtu25937@veltech.edu.in',
          to: userEmail,
          subject: title,
          text: message
        });
        console.log(`[EMAIL SENT] To: ${userEmail}, Subject: ${title}`);
      }
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send email:', err);
    }
  };

  // File Upload Setup
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
  const upload = multer({ storage });

  // --- Auth Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const [rows]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const [result]: any = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      const user = rows[0];
      if (!user) return res.status(401).json({ error: 'User not found' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Wrong password' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Profile update
  app.post('/api/profile/update', authenticate, upload.single('resume'), async (req: any, res) => {
    const { bio, skills } = req.body;
    try {
      const [rows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = rows[0];

      const resume_path = req.file ? `/uploads/${req.file.filename}` : user.resume_path;

      await pool.query(
        'UPDATE users SET bio = ?, skills = ?, resume_path = ? WHERE id = ?',
        [bio, skills, resume_path, req.user.id]
      );
      res.json({ success: true, resume_path });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/profile', authenticate, async (req: any, res) => {
    try {
      const [rows]: any = await pool.query('SELECT id, name, email, role, bio, skills, resume_path FROM users WHERE id = ?', [req.user.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Jobs
  app.get('/api/jobs', async (req, res) => {
    const { category, location, experience } = req.query;
    try {
      let query = 'SELECT * FROM jobs WHERE 1=1';
      const params: any[] = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      if (experience) {
        query += ' AND experience = ?';
        params.push(experience);
      }
      if (location) {
        query += ' AND LOWER(location) LIKE ?';
        params.push(`%${String(location).toLowerCase()}%`);
      }

      const [jobs] = await pool.query(query, params);
      res.json(jobs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/employer/jobs', authenticate, async (req: any, res) => {
    try {
      const [jobs] = await pool.query('SELECT * FROM jobs WHERE employer_id = ?', [req.user.id]);
      res.json(jobs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/employer/stats', authenticate, async (req: any, res) => {
    try {
      const [jobs]: any = await pool.query('SELECT id FROM jobs WHERE employer_id = ?', [req.user.id]);
      const myJobIds = jobs.map((j: any) => j.id);

      let totalApplicants = 0;
      let shortlisted = 0;
      let pending = 0;

      if (myJobIds.length > 0) {
        const [apps]: any = await pool.query('SELECT status FROM applications WHERE job_id IN (?)', [myJobIds]);
        totalApplicants = apps.length;
        shortlisted = apps.filter((a: any) => a.status === 'SHORTLISTED').length;
        pending = apps.filter((a: any) => a.status === 'PENDING').length;
      }

      const stats = {
        totalJobs: myJobIds.length,
        totalApplicants,
        shortlisted,
        pending,
      };
      res.json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/jobs', authenticate, async (req: any, res) => {
    if (req.user.role !== 'EMPLOYER' && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { title, description, category, location, experience, salary } = req.body;
    try {
      const [result]: any = await pool.query(
        'INSERT INTO jobs (employer_id, title, description, category, location, experience, salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, title, description, category, location, experience, salary]
      );
      const newJobId = result.insertId;

      // Trigger Job Alerts
      const [matchingSubs]: any = await pool.query(
        'SELECT * FROM subscriptions WHERE (category IS NULL OR category = ?) AND (location IS NULL OR ? LIKE CONCAT("%", location, "%"))',
        [category, location]
      );

      for (const sub of matchingSubs) {
        await createNotification(
          sub.userId,
          'New Job Alert!',
          `A new job matching your criteria: "${title}" has been posted.`
        );
      }

      res.json({ id: newJobId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/jobs/:id', authenticate, async (req: any, res) => {
    const jobId = parseInt(req.params.id);
    try {
      const [rows]: any = await pool.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
      if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });
      const job = rows[0];

      if (job.employer_id !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await pool.query('DELETE FROM jobs WHERE id = ?', [jobId]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Applications
  app.post('/api/applications', authenticate, async (req: any, res) => {
    if (req.user.role !== 'STUDENT') return res.status(403).json({ error: 'Only students can apply' });
    const { job_id, cover_letter } = req.body;

    try {
      const [existing]: any = await pool.query('SELECT id FROM applications WHERE job_id = ? AND student_id = ?', [job_id, req.user.id]);
      if (existing.length > 0) return res.status(400).json({ error: 'Already applied' });

      const [result]: any = await pool.query(
        'INSERT INTO applications (job_id, student_id, cover_letter) VALUES (?, ?, ?)',
        [job_id, req.user.id, cover_letter]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/applications/my', authenticate, async (req: any, res) => {
    try {
      const query = `
        SELECT a.*, j.title as job_title, j.location as job_location
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.student_id = ?
        ORDER BY a.applied_at DESC
      `;
      const [apps] = await pool.query(query, [req.user.id]);
      res.json(apps);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/employer/applications', authenticate, async (req: any, res) => {
    try {
      const query = `
        SELECT a.*, u.name as applicant_name, u.email as applicant_email, u.resume_path, j.title as job_title
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users u ON a.student_id = u.id
        WHERE j.employer_id = ?
        ORDER BY a.applied_at DESC
      `;
      const [apps] = await pool.query(query, [req.user.id]);
      res.json(apps);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/applications/:id/status', authenticate, async (req: any, res) => {
    const { status } = req.body;
    const appId = parseInt(req.params.id);

    try {
      const [appRows]: any = await pool.query('SELECT * FROM applications WHERE id = ?', [appId]);
      if (appRows.length === 0) return res.status(404).json({ error: 'Application not found' });
      const app = appRows[0];

      const [jobRows]: any = await pool.query('SELECT * FROM jobs WHERE id = ?', [app.job_id]);
      const job = jobRows[0];

      if (!job || (job.employer_id !== req.user.id && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, appId]);

      if (status !== 'PENDING') {
        await createNotification(
          app.student_id,
          `Application ${status}`,
          `Your application for "${job.title}" has been ${status.toLowerCase()}.`
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Job Alerts & Notifications API
  app.get('/api/notifications', authenticate, async (req: any, res) => {
    try {
      const [list] = await pool.query('SELECT * FROM notifications WHERE userId = ? ORDER BY date DESC', [req.user.id]);
      res.json(list);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/notifications/read', authenticate, async (req: any, res) => {
    try {
      await pool.query('UPDATE notifications SET read_status = TRUE WHERE userId = ?', [req.user.id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/subscriptions', authenticate, async (req: any, res) => {
    try {
      const [subs] = await pool.query('SELECT * FROM subscriptions WHERE userId = ?', [req.user.id]);
      res.json(subs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/subscriptions', authenticate, async (req: any, res) => {
    const { category, location } = req.body;
    try {
      const [result]: any = await pool.query(
        'INSERT INTO subscriptions (userId, category, location) VALUES (?, ?, ?)',
        [req.user.id, category, location]
      );
      res.json({ id: result.insertId, userId: req.user.id, category, location });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.delete('/api/subscriptions/:id', authenticate, async (req: any, res) => {
    try {
      await pool.query('DELETE FROM subscriptions WHERE id = ? AND userId = ?', [parseInt(req.params.id), req.user.id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Serve uploads
  app.use('/uploads', express.static(uploadDir));

  // --- Vite Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
