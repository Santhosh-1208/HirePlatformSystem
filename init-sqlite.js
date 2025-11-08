const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('hireconnect.db');

db.exec('PRAGMA foreign_keys = ON;');

const schema = `
CREATE TABLE IF NOT EXISTS Companies (
    company_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    website TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Jobs (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    job_title TEXT NOT NULL,
    job_category TEXT NOT NULL,
    job_description TEXT,
    location TEXT,
    salary_min REAL NOT NULL CHECK (salary_min >= 15000),
    salary_max REAL NOT NULL CHECK (salary_max >= salary_min),
    employment_type TEXT DEFAULT 'Full-time',
    experience_required TEXT,
    posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Active',
    recruiter_id INTEGER,
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Applicants (
    applicant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'Applicant',
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Resumes (
    resume_id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    resume_text TEXT,
    file_path TEXT,
    skills TEXT,
    education TEXT,
    work_experience TEXT,
    certifications TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Applications (
    application_id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    applicant_id INTEGER NOT NULL,
    resume_id INTEGER,
    cover_letter TEXT,
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Submitted',
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id) ON DELETE SET NULL,
    UNIQUE (job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS Interviews (
    interview_id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    recruiter_id INTEGER NOT NULL,
    interview_date DATETIME NOT NULL,
    interview_type TEXT DEFAULT 'Phone',
    location TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES Applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Evaluations (
    evaluation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    recruiter_id INTEGER NOT NULL,
    technical_score INTEGER CHECK (technical_score BETWEEN 1 AND 10),
    communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 10),
    cultural_fit_score INTEGER CHECK (cultural_fit_score BETWEEN 1 AND 10),
    overall_score REAL,
    feedback TEXT,
    recommendation TEXT,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES Interviews(interview_id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Offers (
    offer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    applicant_id INTEGER NOT NULL,
    salary_offered REAL NOT NULL CHECK (salary_offered >= 15000),
    benefits TEXT,
    start_date DATE,
    offer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME,
    status TEXT DEFAULT 'Pending',
    recruiter_id INTEGER,
    FOREIGN KEY (application_id) REFERENCES Applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES Applicants(applicant_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS OnboardingTasks (
    task_id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    offer_id INTEGER NOT NULL,
    task_name TEXT NOT NULL,
    task_description TEXT,
    task_type TEXT DEFAULT 'Other',
    status TEXT DEFAULT 'Pending',
    due_date DATE,
    completed_date DATE,
    assigned_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES Offers(offer_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES Applicants(applicant_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_applicant_id ON Applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_id ON Jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_interview_date ON Interviews(interview_date);

CREATE VIEW IF NOT EXISTS JobStatistics AS
SELECT 
    j.job_id,
    j.job_title,
    c.company_name,
    j.job_category,
    COUNT(DISTINCT a.application_id) AS ApplicantsCount,
    COUNT(DISTINCT o.offer_id) AS OffersMade,
    COALESCE(AVG(e.overall_score), 0) AS AvgEvaluationScore,
    j.status AS JobStatus
FROM Jobs j
LEFT JOIN Companies c ON j.company_id = c.company_id
LEFT JOIN Applications a ON j.job_id = a.job_id
LEFT JOIN Interviews i ON a.application_id = i.application_id
LEFT JOIN Evaluations e ON i.interview_id = e.interview_id
LEFT JOIN Offers o ON j.job_id = o.job_id
GROUP BY j.job_id, j.job_title, c.company_name, j.job_category, j.status;
`;

console.log('Creating database schema...');
db.exec(schema);

console.log('Inserting sample data...');

const insert = db.prepare('INSERT INTO Companies (company_name, industry, location, website, description) VALUES (?, ?, ?, ?, ?)');
const companies = [
    ['TechCorp Solutions', 'Technology', 'San Francisco, CA', 'www.techcorp.com', 'Leading software development company'],
    ['Global Finance Inc', 'Finance', 'New York, NY', 'www.globalfinance.com', 'International financial services provider'],
    ['HealthCare Plus', 'Healthcare', 'Boston, MA', 'www.healthcareplus.com', 'Healthcare and medical services'],
    ['EduLearn Systems', 'Education', 'Austin, TX', 'www.edulearn.com', 'Online education platform'],
    ['RetailMax', 'Retail', 'Seattle, WA', 'www.retailmax.com', 'E-commerce retail solutions'],
    ['DataAnalytics Pro', 'Technology', 'Chicago, IL', 'www.dataanalytics.com', 'Big data and analytics services'],
    ['CreativeMedia Co', 'Media', 'Los Angeles, CA', 'www.creativemedia.com', 'Digital media and content creation']
];

companies.forEach(c => insert.run(...c));

const insertApplicant = db.prepare('INSERT INTO Applicants (first_name, last_name, email, phone, location, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const applicants = [
    ['John', 'Admin', 'admin@hireconnect.com', '555-0001', 'San Francisco, CA', '$2b$10$abcdefgh', 'Admin', 'Active'],
    ['Sarah', 'Wilson', 'sarah.recruiter@hireconnect.com', '555-0002', 'New York, NY', '$2b$10$abcdefgh', 'Recruiter', 'Active'],
    ['Mike', 'Johnson', 'mike.recruiter@hireconnect.com', '555-0003', 'Boston, MA', '$2b$10$abcdefgh', 'Recruiter', 'Active'],
    ['Lisa', 'HR', 'lisa.hr@hireconnect.com', '555-0004', 'Austin, TX', '$2b$10$abcdefgh', 'HRManager', 'Active'],
    ['David', 'Recruiter', 'david.recruiter@hireconnect.com', '555-0005', 'Seattle, WA', '$2b$10$abcdefgh', 'Recruiter', 'Active'],
    ['Emily', 'Smith', 'emily.smith@email.com', '555-1001', 'San Francisco, CA', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Michael', 'Brown', 'michael.brown@email.com', '555-1002', 'New York, NY', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Jessica', 'Davis', 'jessica.davis@email.com', '555-1003', 'Boston, MA', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Robert', 'Miller', 'robert.miller@email.com', '555-1004', 'Austin, TX', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Amanda', 'Taylor', 'amanda.taylor@email.com', '555-1005', 'Chicago, IL', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['James', 'Anderson', 'james.anderson@email.com', '555-1006', 'Los Angeles, CA', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Laura', 'Thomas', 'laura.thomas@email.com', '555-1007', 'Seattle, WA', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Daniel', 'Martinez', 'daniel.martinez@email.com', '555-1008', 'Denver, CO', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Sophia', 'Garcia', 'sophia.garcia@email.com', '555-1009', 'Miami, FL', '$2b$10$abcdefgh', 'Applicant', 'Active'],
    ['Christopher', 'Wilson', 'chris.wilson@email.com', '555-1010', 'Portland, OR', '$2b$10$abcdefgh', 'Applicant', 'Active']
];

applicants.forEach(a => insertApplicant.run(...a));

const insertJob = db.prepare('INSERT INTO Jobs (company_id, job_title, job_category, job_description, location, salary_min, salary_max, employment_type, experience_required, recruiter_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const jobs = [
    [1, 'Senior Software Engineer', 'Engineering', 'Develop scalable web applications', 'San Francisco, CA', 120000, 180000, 'Full-time', '5+ years', 2, 'Active'],
    [1, 'Frontend Developer', 'Engineering', 'Build responsive user interfaces', 'San Francisco, CA', 90000, 130000, 'Full-time', '3+ years', 2, 'Active'],
    [2, 'Financial Analyst', 'Finance', 'Analyze financial data and trends', 'New York, NY', 80000, 120000, 'Full-time', '2+ years', 3, 'Active'],
    [2, 'Investment Banking Associate', 'Finance', 'Manage investment portfolios', 'New York, NY', 100000, 150000, 'Full-time', '3+ years', 3, 'Active'],
    [3, 'Registered Nurse', 'Healthcare', 'Provide patient care', 'Boston, MA', 70000, 95000, 'Full-time', '2+ years', 3, 'Active'],
    [3, 'Medical Lab Technician', 'Healthcare', 'Conduct laboratory tests', 'Boston, MA', 55000, 75000, 'Full-time', '1+ years', 3, 'Active'],
    [4, 'Curriculum Developer', 'Education', 'Design educational content', 'Austin, TX', 65000, 90000, 'Full-time', '3+ years', 5, 'Active'],
    [4, 'Online Tutor', 'Education', 'Teach students online', 'Austin, TX', 40000, 60000, 'Part-time', '1+ years', 5, 'Active'],
    [5, 'E-commerce Manager', 'Retail', 'Manage online sales platform', 'Seattle, WA', 85000, 115000, 'Full-time', '4+ years', 5, 'Active'],
    [6, 'Data Scientist', 'Technology', 'Analyze large datasets', 'Chicago, IL', 110000, 160000, 'Full-time', '4+ years', 2, 'Active'],
    [6, 'Business Intelligence Analyst', 'Technology', 'Create data visualizations', 'Chicago, IL', 75000, 105000, 'Full-time', '2+ years', 2, 'Active'],
    [7, 'Content Writer', 'Media', 'Create engaging content', 'Los Angeles, CA', 50000, 70000, 'Contract', '2+ years', 5, 'Active'],
    [1, 'DevOps Engineer', 'Engineering', 'Manage cloud infrastructure', 'San Francisco, CA', 115000, 165000, 'Full-time', '4+ years', 2, 'Closed'],
    [2, 'Compliance Officer', 'Finance', 'Ensure regulatory compliance', 'New York, NY', 90000, 130000, 'Full-time', '5+ years', 3, 'Active']
];

jobs.forEach(j => insertJob.run(...j));

console.log('Sample data inserted successfully');
console.log('Database initialization complete!');

db.close();
