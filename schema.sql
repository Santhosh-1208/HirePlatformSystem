-- HireConnect Platform Database Schema
-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS hireconnect;
CREATE DATABASE hireconnect;
USE hireconnect;

-- Table 1: Companies
CREATE TABLE Companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_name (company_name)
);

-- Table 2: Jobs
CREATE TABLE Jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_category VARCHAR(100) NOT NULL,
    job_description TEXT,
    location VARCHAR(255),
    salary_min DECIMAL(10, 2) NOT NULL CHECK (salary_min >= 15000),
    salary_max DECIMAL(10, 2) NOT NULL CHECK (salary_max >= salary_min),
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') DEFAULT 'Full-time',
    experience_required VARCHAR(50),
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Active', 'Closed', 'On Hold') DEFAULT 'Active',
    recruiter_id INT,
    FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_job_category (job_category),
    INDEX idx_posted_date (posted_date)
);

-- Table 3: Applicants
CREATE TABLE Applicants (
    applicant_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    location VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Recruiter', 'Applicant', 'HRManager') DEFAULT 'Applicant',
    status ENUM('Active', 'Hired', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_applicant_id (applicant_id),
    INDEX idx_email (email)
);

-- Table 4: Resumes
CREATE TABLE Resumes (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    resume_text TEXT,
    file_path VARCHAR(500),
    skills TEXT,
    education TEXT,
    work_experience TEXT,
    certifications TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE
);

-- Table 5: Applications
CREATE TABLE Applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    applicant_id INT NOT NULL,
    resume_id INT,
    cover_letter TEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Submitted', 'Under Review', 'Interview', 'Rejected', 'Offer Extended', 'Hired') DEFAULT 'Submitted',
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id) ON DELETE SET NULL,
    UNIQUE KEY unique_application (job_id, applicant_id),
    INDEX idx_application_date (application_date)
);

-- Table 6: Interviews
CREATE TABLE Interviews (
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    recruiter_id INT NOT NULL,
    interview_date DATETIME NOT NULL,
    interview_type ENUM('Phone', 'Video', 'In-Person', 'Technical') DEFAULT 'Phone',
    location VARCHAR(255),
    notes TEXT,
    status ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES Applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE,
    INDEX idx_interview_date (interview_date),
    INDEX idx_recruiter_id (recruiter_id)
);

-- Table 7: Evaluations
CREATE TABLE Evaluations (
    evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    recruiter_id INT NOT NULL,
    technical_score INT CHECK (technical_score BETWEEN 1 AND 10),
    communication_score INT CHECK (communication_score BETWEEN 1 AND 10),
    cultural_fit_score INT CHECK (cultural_fit_score BETWEEN 1 AND 10),
    overall_score DECIMAL(4, 2),
    feedback TEXT,
    recommendation ENUM('Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend', 'Strongly Not Recommend'),
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES Interviews(interview_id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE
);

-- Table 8: Offers
CREATE TABLE Offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    job_id INT NOT NULL,
    applicant_id INT NOT NULL,
    salary_offered DECIMAL(10, 2) NOT NULL CHECK (salary_offered >= 15000),
    benefits TEXT,
    start_date DATE,
    offer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME,
    status ENUM('Pending', 'Accepted', 'Rejected', 'Expired') DEFAULT 'Pending',
    recruiter_id INT,
    FOREIGN KEY (application_id) REFERENCES Applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE,
    FOREIGN KEY (recruiter_id) REFERENCES Applicants(applicant_id) ON DELETE SET NULL
);

-- Table 9: OnboardingTasks
CREATE TABLE OnboardingTasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    offer_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_type ENUM('Document', 'Training', 'Equipment', 'System Access', 'Other') DEFAULT 'Other',
    status ENUM('Pending', 'In Progress', 'Completed', 'Overdue') DEFAULT 'Pending',
    due_date DATE,
    completed_date DATE,
    assigned_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES Applicants(applicant_id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES Offers(offer_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES Applicants(applicant_id) ON DELETE SET NULL
);

-- Create Database View: Job Statistics
CREATE VIEW JobStatistics AS
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
