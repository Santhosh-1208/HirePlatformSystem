const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool, initializeDatabase } = require('./config/database');
const { checkRole, canViewProfile } = require('./middleware/auth');
const { jobSearchValidator, offerValidator, applicationValidator } = require('./middleware/validators');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as health');
        res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.get('/api/companies', checkRole(['Admin', 'Recruiter', 'HRManager', 'Applicant']), async (req, res) => {
    try {
        const [companies] = await pool.query('SELECT * FROM Companies ORDER BY company_name');
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/jobs', checkRole(['Admin', 'Recruiter', 'HRManager', 'Applicant']), jobSearchValidator, async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let query = `
            SELECT j.*, c.company_name 
            FROM Jobs j
            INNER JOIN Companies c ON j.company_id = c.company_id
            WHERE 1=1
        `;
        const params = [];
        
        if (search) {
            query += ' AND (j.job_title LIKE ? OR j.job_description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (category) {
            query += ' AND j.job_category = ?';
            params.push(category);
        }
        
        if (status) {
            query += ' AND j.status = ?';
            params.push(status);
        } else {
            query += ' AND j.status = "Active"';
        }
        
        query += ' ORDER BY j.posted_date DESC';
        
        const [jobs] = await pool.query(query, params);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/jobs', checkRole(['Admin', 'Recruiter']), async (req, res) => {
    try {
        const { company_id, job_title, job_category, job_description, location, 
                salary_min, salary_max, employment_type, experience_required } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO Jobs (company_id, job_title, job_category, job_description, location, 
             salary_min, salary_max, employment_type, experience_required, recruiter_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [company_id, job_title, job_category, job_description, location, 
             salary_min, salary_max, employment_type, experience_required, req.user.id]
        );
        
        res.status(201).json({ message: 'Job created successfully', job_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/applicants/:id', checkRole(['Admin', 'Recruiter', 'HRManager', 'Applicant']), canViewProfile, async (req, res) => {
    try {
        const { id } = req.params;
        const shouldMaskLocation = req.user.role === 'Applicant' && req.user.id !== parseInt(id);
        
        let query = shouldMaskLocation
            ? `SELECT applicant_id, first_name, last_name, email, phone, 
                      '***MASKED***' as location, role, status, created_at 
               FROM Applicants WHERE applicant_id = ?`
            : `SELECT applicant_id, first_name, last_name, email, phone, location, 
                      role, status, created_at 
               FROM Applicants WHERE applicant_id = ?`;
        
        const [applicants] = await pool.query(query, [id]);
        
        if (applicants.length === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }
        
        res.json(applicants[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/applications', checkRole(['Admin', 'Recruiter', 'HRManager', 'Applicant']), async (req, res) => {
    try {
        let query = `
            SELECT a.*, j.job_title, c.company_name, 
                   CONCAT(ap.first_name, ' ', ap.last_name) as applicant_name
            FROM Applications a
            INNER JOIN Jobs j ON a.job_id = j.job_id
            INNER JOIN Companies c ON j.company_id = c.company_id
            INNER JOIN Applicants ap ON a.applicant_id = ap.applicant_id
        `;
        
        if (req.user.role === 'Applicant') {
            query += ' WHERE a.applicant_id = ?';
            const [applications] = await pool.query(query, [req.user.id]);
            return res.json(applications);
        }
        
        query += ' ORDER BY a.application_date DESC';
        const [applications] = await pool.query(query);
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/applications', checkRole(['Applicant']), applicationValidator, async (req, res) => {
    try {
        const { job_id, resume_id, cover_letter } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO Applications (job_id, applicant_id, resume_id, cover_letter) VALUES (?, ?, ?, ?)',
            [job_id, req.user.id, resume_id, cover_letter]
        );
        
        res.status(201).json({ message: 'Application submitted successfully', application_id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'You have already applied to this job' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.get('/api/interviews', checkRole(['Admin', 'Recruiter', 'HRManager']), async (req, res) => {
    try {
        const [interviews] = await pool.query(`
            SELECT i.*, 
                   CONCAT(a.first_name, ' ', a.last_name) as applicant_name,
                   CONCAT(r.first_name, ' ', r.last_name) as recruiter_name,
                   j.job_title
            FROM Interviews i
            INNER JOIN Applications app ON i.application_id = app.application_id
            INNER JOIN Applicants a ON app.applicant_id = a.applicant_id
            INNER JOIN Applicants r ON i.recruiter_id = r.applicant_id
            INNER JOIN Jobs j ON app.job_id = j.job_id
            ORDER BY i.interview_date DESC
        `);
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/interviews', checkRole(['Recruiter', 'HRManager']), async (req, res) => {
    try {
        const { application_id, interview_date, interview_type, location, notes } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO Interviews (application_id, recruiter_id, interview_date, interview_type, location, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [application_id, req.user.id, interview_date, interview_type, location, notes]
        );
        
        res.status(201).json({ message: 'Interview scheduled successfully', interview_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/evaluations', checkRole(['Recruiter', 'HRManager']), async (req, res) => {
    try {
        const { interview_id, technical_score, communication_score, cultural_fit_score, feedback, recommendation } = req.body;
        const overall_score = ((technical_score + communication_score + cultural_fit_score) / 3).toFixed(2);
        
        const [result] = await pool.query(
            `INSERT INTO Evaluations (interview_id, recruiter_id, technical_score, communication_score, 
             cultural_fit_score, overall_score, feedback, recommendation) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [interview_id, req.user.id, technical_score, communication_score, cultural_fit_score, 
             overall_score, feedback, recommendation]
        );
        
        res.status(201).json({ message: 'Evaluation submitted successfully', evaluation_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/offers', checkRole(['Recruiter', 'HRManager', 'Admin']), offerValidator, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { application_id, salary_offered, benefits, start_date, expiry_date } = req.body;
        const minimumWage = parseFloat(process.env.MINIMUM_WAGE) || 15000;
        
        if (salary_offered < minimumWage) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Transaction rolled back',
                message: `Salary package invalid. Minimum wage is ${minimumWage}` 
            });
        }
        
        const [appData] = await connection.query(
            'SELECT job_id, applicant_id FROM Applications WHERE application_id = ?',
            [application_id]
        );
        
        if (appData.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Application not found' });
        }
        
        const { job_id, applicant_id } = appData[0];
        
        const [offerResult] = await connection.query(
            `INSERT INTO Offers (application_id, job_id, applicant_id, salary_offered, benefits, 
             start_date, expiry_date, recruiter_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [application_id, job_id, applicant_id, salary_offered, benefits, start_date, expiry_date, req.user.id]
        );
        
        await connection.query(
            'UPDATE Applications SET status = ? WHERE application_id = ?',
            ['Offer Extended', application_id]
        );
        
        await connection.commit();
        
        res.status(201).json({ 
            message: 'Offer issued successfully with transaction',
            offer_id: offerResult.insertId,
            transaction: 'committed'
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ 
            error: error.message,
            transaction: 'rolled back'
        });
    } finally {
        connection.release();
    }
});

app.get('/api/offers', checkRole(['Admin', 'Recruiter', 'HRManager', 'Applicant']), async (req, res) => {
    try {
        let query = `
            SELECT o.*, 
                   CONCAT(a.first_name, ' ', a.last_name) as applicant_name,
                   j.job_title,
                   c.company_name
            FROM Offers o
            INNER JOIN Applicants a ON o.applicant_id = a.applicant_id
            INNER JOIN Jobs j ON o.job_id = j.job_id
            INNER JOIN Companies c ON j.company_id = c.company_id
        `;
        
        if (req.user.role === 'Applicant') {
            query += ' WHERE o.applicant_id = ?';
            const [offers] = await pool.query(query, [req.user.id]);
            return res.json(offers);
        }
        
        query += ' ORDER BY o.offer_date DESC';
        const [offers] = await pool.query(query);
        res.json(offers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/multiple-applications', checkRole(['Admin', 'Recruiter', 'HRManager']), async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                a.applicant_id,
                CONCAT(a.first_name, ' ', a.last_name) AS applicant_name,
                a.email,
                COUNT(app.application_id) AS total_applications,
                GROUP_CONCAT(j.job_title SEPARATOR ', ') AS applied_jobs
            FROM Applicants a
            INNER JOIN Applications app ON a.applicant_id = app.applicant_id
            INNER JOIN Jobs j ON app.job_id = j.job_id
            GROUP BY a.applicant_id, a.first_name, a.last_name, a.email
            HAVING COUNT(app.application_id) > 5
            ORDER BY total_applications DESC
        `);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/jobs-no-applications', checkRole(['Admin', 'Recruiter', 'HRManager']), async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                j.job_id,
                j.job_title,
                c.company_name,
                j.job_category,
                j.location,
                j.salary_min,
                j.salary_max,
                j.posted_date,
                DATEDIFF(CURDATE(), j.posted_date) AS days_posted
            FROM Jobs j
            LEFT JOIN Applications a ON j.job_id = a.job_id
            INNER JOIN Companies c ON j.company_id = c.company_id
            WHERE a.application_id IS NULL AND j.status = 'Active'
            ORDER BY j.posted_date DESC
        `);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/conversion-rates', checkRole(['Admin', 'HRManager']), async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                r.applicant_id AS recruiter_id,
                CONCAT(r.first_name, ' ', r.last_name) AS recruiter_name,
                COUNT(DISTINCT i.interview_id) AS total_interviews,
                COUNT(DISTINCT o.offer_id) AS total_offers,
                ROUND((COUNT(DISTINCT o.offer_id) * 100.0 / NULLIF(COUNT(DISTINCT i.interview_id), 0)), 2) AS conversion_rate_percentage
            FROM Applicants r
            LEFT JOIN Interviews i ON r.applicant_id = i.recruiter_id
            LEFT JOIN Applications app ON i.application_id = app.application_id
            LEFT JOIN Offers o ON app.application_id = o.application_id
            WHERE r.role = 'Recruiter'
            GROUP BY r.applicant_id, r.first_name, r.last_name
            ORDER BY conversion_rate_percentage DESC
        `);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/pending-offers', checkRole(['Admin', 'Recruiter', 'HRManager']), async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                o.offer_id,
                CONCAT(a.first_name, ' ', a.last_name) AS applicant_name,
                j.job_title,
                c.company_name,
                o.salary_offered,
                o.offer_date,
                DATEDIFF(CURDATE(), o.offer_date) AS days_pending,
                o.expiry_date,
                o.status
            FROM Offers o
            INNER JOIN Applicants a ON o.applicant_id = a.applicant_id
            INNER JOIN Jobs j ON o.job_id = j.job_id
            INNER JOIN Companies c ON j.company_id = c.company_id
            WHERE o.status = 'Pending' AND DATEDIFF(CURDATE(), o.offer_date) > 14
            ORDER BY days_pending DESC
        `);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/onboarding-status', checkRole(['Admin', 'HRManager']), async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                CONCAT(a.first_name, ' ', a.last_name) AS applicant_name,
                j.job_title,
                c.company_name,
                COUNT(ot.task_id) AS total_tasks,
                SUM(CASE WHEN ot.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
                SUM(CASE WHEN ot.status = 'Pending' THEN 1 ELSE 0 END) AS pending_tasks,
                ROUND((SUM(CASE WHEN ot.status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(ot.task_id)), 2) AS completion_percentage
            FROM OnboardingTasks ot
            INNER JOIN Applicants a ON ot.applicant_id = a.applicant_id
            INNER JOIN Offers o ON ot.offer_id = o.offer_id
            INNER JOIN Jobs j ON o.job_id = j.job_id
            INNER JOIN Companies c ON j.company_id = c.company_id
            GROUP BY a.applicant_id, a.first_name, a.last_name, j.job_title, c.company_name
            ORDER BY completion_percentage DESC
        `);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/job-categories', checkRole(['Admin', 'Recruiter', 'HRManager']), async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                j.job_category,
                COUNT(DISTINCT a.application_id) AS total_applications,
                COUNT(DISTINCT j.job_id) AS total_jobs,
                COUNT(DISTINCT a.applicant_id) AS unique_applicants
            FROM Jobs j
            LEFT JOIN Applications a ON j.job_id = a.job_id
            GROUP BY j.job_category
            ORDER BY total_applications DESC
        `);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/job-statistics', checkRole(['Admin', 'Recruiter', 'HRManager']), async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM JobStatistics ORDER BY ApplicantsCount DESC');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function startServer() {
    try {
        const dbConnected = await initializeDatabase();
        if (!dbConnected) {
            console.error('Failed to connect to database. Please check your database configuration.');
            process.exit(1);
        }
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`HireConnect Platform running on http://0.0.0.0:${PORT}`);
            console.log('Database: Connected');
            console.log('RBAC: Enabled (Admin, Recruiter, Applicant, HRManager)');
            console.log('SQL Injection Protection: Active');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
