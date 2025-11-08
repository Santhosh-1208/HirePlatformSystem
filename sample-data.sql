-- Sample Data for HireConnect Platform
USE hireconnect;

-- Insert Companies
INSERT INTO Companies (company_name, industry, location, website, description) VALUES
('TechCorp Solutions', 'Technology', 'San Francisco, CA', 'www.techcorp.com', 'Leading software development company'),
('Global Finance Inc', 'Finance', 'New York, NY', 'www.globalfinance.com', 'International financial services provider'),
('HealthCare Plus', 'Healthcare', 'Boston, MA', 'www.healthcareplus.com', 'Healthcare and medical services'),
('EduLearn Systems', 'Education', 'Austin, TX', 'www.edulearn.com', 'Online education platform'),
('RetailMax', 'Retail', 'Seattle, WA', 'www.retailmax.com', 'E-commerce retail solutions'),
('DataAnalytics Pro', 'Technology', 'Chicago, IL', 'www.dataanalytics.com', 'Big data and analytics services'),
('CreativeMedia Co', 'Media', 'Los Angeles, CA', 'www.creativemedia.com', 'Digital media and content creation');

-- Insert Applicants (Including Recruiters, HR Managers, and Admin)
INSERT INTO Applicants (first_name, last_name, email, phone, location, password_hash, role, status) VALUES
('John', 'Admin', 'admin@hireconnect.com', '555-0001', 'San Francisco, CA', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Admin', 'Active'),
('Sarah', 'Wilson', 'sarah.recruiter@hireconnect.com', '555-0002', 'New York, NY', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Recruiter', 'Active'),
('Mike', 'Johnson', 'mike.recruiter@hireconnect.com', '555-0003', 'Boston, MA', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Recruiter', 'Active'),
('Lisa', 'HR', 'lisa.hr@hireconnect.com', '555-0004', 'Austin, TX', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'HRManager', 'Active'),
('David', 'Recruiter', 'david.recruiter@hireconnect.com', '555-0005', 'Seattle, WA', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Recruiter', 'Active'),
('Emily', 'Smith', 'emily.smith@email.com', '555-1001', 'San Francisco, CA', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Michael', 'Brown', 'michael.brown@email.com', '555-1002', 'New York, NY', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Jessica', 'Davis', 'jessica.davis@email.com', '555-1003', 'Boston, MA', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Robert', 'Miller', 'robert.miller@email.com', '555-1004', 'Austin, TX', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Amanda', 'Taylor', 'amanda.taylor@email.com', '555-1005', 'Chicago, IL', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('James', 'Anderson', 'james.anderson@email.com', '555-1006', 'Los Angeles, CA', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Laura', 'Thomas', 'laura.thomas@email.com', '555-1007', 'Seattle, WA', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Daniel', 'Martinez', 'daniel.martinez@email.com', '555-1008', 'Denver, CO', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Sophia', 'Garcia', 'sophia.garcia@email.com', '555-1009', 'Miami, FL', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active'),
('Christopher', 'Wilson', 'chris.wilson@email.com', '555-1010', 'Portland, OR', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'Applicant', 'Active');

-- Insert Jobs
INSERT INTO Jobs (company_id, job_title, job_category, job_description, location, salary_min, salary_max, employment_type, experience_required, recruiter_id, status) VALUES
(1, 'Senior Software Engineer', 'Engineering', 'Develop scalable web applications', 'San Francisco, CA', 120000, 180000, 'Full-time', '5+ years', 2, 'Active'),
(1, 'Frontend Developer', 'Engineering', 'Build responsive user interfaces', 'San Francisco, CA', 90000, 130000, 'Full-time', '3+ years', 2, 'Active'),
(2, 'Financial Analyst', 'Finance', 'Analyze financial data and trends', 'New York, NY', 80000, 120000, 'Full-time', '2+ years', 3, 'Active'),
(2, 'Investment Banking Associate', 'Finance', 'Manage investment portfolios', 'New York, NY', 100000, 150000, 'Full-time', '3+ years', 3, 'Active'),
(3, 'Registered Nurse', 'Healthcare', 'Provide patient care', 'Boston, MA', 70000, 95000, 'Full-time', '2+ years', 3, 'Active'),
(3, 'Medical Lab Technician', 'Healthcare', 'Conduct laboratory tests', 'Boston, MA', 55000, 75000, 'Full-time', '1+ years', 3, 'Active'),
(4, 'Curriculum Developer', 'Education', 'Design educational content', 'Austin, TX', 65000, 90000, 'Full-time', '3+ years', 5, 'Active'),
(4, 'Online Tutor', 'Education', 'Teach students online', 'Austin, TX', 40000, 60000, 'Part-time', '1+ years', 5, 'Active'),
(5, 'E-commerce Manager', 'Retail', 'Manage online sales platform', 'Seattle, WA', 85000, 115000, 'Full-time', '4+ years', 5, 'Active'),
(6, 'Data Scientist', 'Technology', 'Analyze large datasets', 'Chicago, IL', 110000, 160000, 'Full-time', '4+ years', 2, 'Active'),
(6, 'Business Intelligence Analyst', 'Technology', 'Create data visualizations', 'Chicago, IL', 75000, 105000, 'Full-time', '2+ years', 2, 'Active'),
(7, 'Content Writer', 'Media', 'Create engaging content', 'Los Angeles, CA', 50000, 70000, 'Contract', '2+ years', 5, 'Active'),
(1, 'DevOps Engineer', 'Engineering', 'Manage cloud infrastructure', 'San Francisco, CA', 115000, 165000, 'Full-time', '4+ years', 2, 'Closed'),
(2, 'Compliance Officer', 'Finance', 'Ensure regulatory compliance', 'New York, NY', 90000, 130000, 'Full-time', '5+ years', 3, 'Active');

-- Insert Resumes
INSERT INTO Resumes (applicant_id, resume_text, skills, education, work_experience, certifications) VALUES
(6, 'Experienced software engineer', 'JavaScript, React, Node.js, Python, SQL', 'BS Computer Science - Stanford University', '5 years at Google, 3 years at Amazon', 'AWS Certified Solutions Architect'),
(7, 'Financial professional', 'Excel, Financial Modeling, Bloomberg Terminal', 'MBA Finance - Harvard Business School', '4 years at JP Morgan', 'CFA Level II'),
(8, 'Healthcare specialist', 'Patient Care, Medical Records, EMR Systems', 'BSN Nursing - Johns Hopkins University', '3 years at Massachusetts General Hospital', 'RN License'),
(9, 'Education expert', 'Curriculum Design, LMS, Instructional Design', 'MEd Education - Columbia University', '6 years teaching experience', 'Certified Teacher'),
(10, 'Retail professional', 'E-commerce, Inventory Management, Analytics', 'BA Business Administration - UCLA', '5 years at Amazon Retail', 'Google Analytics Certified'),
(11, 'Data professional', 'Python, R, SQL, Machine Learning, Tableau', 'MS Data Science - MIT', '4 years data analysis experience', 'Microsoft Certified Data Analyst'),
(12, 'Creative writer', 'Content Writing, SEO, Social Media', 'BA Journalism - Northwestern University', '3 years freelance writing', 'HubSpot Content Marketing'),
(13, 'Tech enthusiast', 'Java, Spring, Docker, Kubernetes', 'BS Software Engineering - UC Berkeley', '2 years at startup', 'Oracle Java Certified'),
(14, 'Finance analyst', 'Financial Analysis, Risk Management', 'BS Finance - NYU Stern', '3 years at Goldman Sachs', 'FRM Certification'),
(15, 'Developer', 'React, Angular, Vue.js, TypeScript', 'BS Computer Science - Carnegie Mellon', '4 years frontend development', 'React Certification');

-- Insert Applications (Creating multiple applications for some applicants to test >5 jobs query)
INSERT INTO Applications (job_id, applicant_id, resume_id, cover_letter, status) VALUES
(1, 6, 1, 'I am excited to apply for the Senior Software Engineer position', 'Interview'),
(2, 6, 1, 'Applying for Frontend Developer role', 'Under Review'),
(10, 6, 1, 'Interested in Data Scientist position', 'Interview'),
(11, 6, 1, 'Applying for BI Analyst role', 'Submitted'),
(13, 6, 1, 'DevOps Engineer application', 'Rejected'),
(14, 6, 1, 'Compliance Officer application', 'Submitted'),
(3, 7, 2, 'Financial Analyst position application', 'Interview'),
(4, 7, 2, 'Investment Banking Associate application', 'Interview'),
(14, 7, 2, 'Compliance Officer application', 'Under Review'),
(5, 8, 3, 'Registered Nurse application', 'Offer Extended'),
(6, 8, 3, 'Medical Lab Technician application', 'Under Review'),
(7, 9, 4, 'Curriculum Developer application', 'Interview'),
(8, 9, 4, 'Online Tutor application', 'Submitted'),
(9, 10, 5, 'E-commerce Manager application', 'Interview'),
(10, 11, 6, 'Data Scientist application', 'Interview'),
(11, 11, 6, 'BI Analyst application', 'Submitted'),
(12, 12, 7, 'Content Writer application', 'Under Review'),
(1, 13, 8, 'Senior Software Engineer application', 'Submitted'),
(2, 15, 10, 'Frontend Developer application', 'Interview'),
(3, 14, 9, 'Financial Analyst application', 'Interview');

-- Insert Interviews
INSERT INTO Interviews (application_id, recruiter_id, interview_date, interview_type, location, notes, status) VALUES
(1, 2, '2024-12-15 10:00:00', 'Video', 'Zoom', 'Technical round', 'Completed'),
(1, 3, '2024-12-18 14:00:00', 'Technical', 'San Francisco Office', 'System design interview', 'Completed'),
(3, 2, '2024-12-20 11:00:00', 'Video', 'Zoom', 'Initial screening', 'Completed'),
(7, 3, '2024-12-16 09:00:00', 'In-Person', 'New York Office', 'Financial case study', 'Completed'),
(8, 3, '2024-12-17 15:00:00', 'Video', 'Teams', 'Behavioral interview', 'Completed'),
(8, 5, '2024-12-22 10:00:00', 'In-Person', 'New York Office', 'Final round', 'Scheduled'),
(10, 3, '2024-12-10 13:00:00', 'Phone', 'Phone', 'Initial screening', 'Completed'),
(10, 5, '2024-12-12 14:00:00', 'In-Person', 'Boston Office', 'Skills assessment', 'Completed'),
(12, 5, '2024-12-19 11:00:00', 'Video', 'Zoom', 'Portfolio review', 'Completed'),
(14, 5, '2024-12-21 10:00:00', 'Video', 'Zoom', 'Initial screening', 'Scheduled'),
(15, 2, '2024-12-23 09:00:00', 'Video', 'Zoom', 'Technical assessment', 'Scheduled'),
(19, 2, '2024-12-24 15:00:00', 'Phone', 'Phone', 'Quick screening', 'Scheduled'),
(20, 3, '2024-12-25 10:00:00', 'Video', 'Teams', 'Interview scheduled', 'Scheduled');

-- Insert Evaluations
INSERT INTO Evaluations (interview_id, recruiter_id, technical_score, communication_score, cultural_fit_score, overall_score, feedback, recommendation) VALUES
(1, 2, 9, 8, 9, 8.67, 'Excellent technical skills and great communication', 'Strongly Recommend'),
(2, 3, 8, 9, 8, 8.33, 'Strong system design knowledge', 'Recommend'),
(3, 2, 7, 8, 7, 7.33, 'Good candidate with solid experience', 'Recommend'),
(4, 3, 9, 9, 8, 8.67, 'Outstanding financial knowledge', 'Strongly Recommend'),
(5, 3, 8, 9, 9, 8.67, 'Great cultural fit and communication', 'Strongly Recommend'),
(7, 3, 8, 8, 9, 8.33, 'Very professional and experienced', 'Recommend'),
(8, 5, 9, 8, 8, 8.33, 'Excellent clinical skills', 'Strongly Recommend'),
(9, 5, 7, 8, 8, 7.67, 'Creative and talented writer', 'Recommend');

-- Insert Offers
INSERT INTO Offers (application_id, job_id, applicant_id, salary_offered, benefits, start_date, offer_date, expiry_date, status, recruiter_id) VALUES
(1, 1, 6, 150000, 'Health insurance, 401k, Stock options', '2025-01-15', '2024-12-01 10:00:00', '2024-12-15 23:59:59', 'Accepted', 2),
(10, 5, 8, 85000, 'Health insurance, PTO, Retirement plan', '2025-02-01', '2024-11-10 14:00:00', '2024-11-24 23:59:59', 'Pending', 3),
(8, 4, 7, 125000, 'Health insurance, Bonus, Stock options', '2025-01-20', '2024-11-15 09:00:00', '2024-11-29 23:59:59', 'Pending', 3),
(14, 9, 10, 95000, 'Health insurance, Remote work, PTO', '2025-02-15', '2024-12-05 11:00:00', '2024-12-19 23:59:59', 'Pending', 5);

-- Insert OnboardingTasks
INSERT INTO OnboardingTasks (applicant_id, offer_id, task_name, task_description, task_type, status, due_date, assigned_by) VALUES
(6, 1, 'Complete I-9 Form', 'Employment eligibility verification', 'Document', 'Completed', '2025-01-10', 4),
(6, 1, 'Sign NDA', 'Non-disclosure agreement', 'Document', 'Completed', '2025-01-10', 4),
(6, 1, 'Security Training', 'Complete online security awareness training', 'Training', 'In Progress', '2025-01-20', 4),
(6, 1, 'Setup Laptop', 'Receive and configure work laptop', 'Equipment', 'Pending', '2025-01-15', 4),
(6, 1, 'Email Account Setup', 'Corporate email and system access', 'System Access', 'Completed', '2025-01-12', 4),
(8, 2, 'Complete I-9 Form', 'Employment eligibility verification', 'Document', 'Pending', '2025-01-25', 4),
(8, 2, 'Healthcare Orientation', 'HIPAA and patient care training', 'Training', 'Pending', '2025-01-30', 4),
(7, 3, 'Background Check', 'Financial industry background verification', 'Document', 'Pending', '2025-01-15', 4),
(7, 3, 'Compliance Training', 'SEC and FINRA compliance training', 'Training', 'Pending', '2025-01-18', 4),
(10, 4, 'Tax Forms', 'W-4 and state tax forms', 'Document', 'Pending', '2025-02-10', 4);
