-- Complex Queries for HireConnect Platform
USE hireconnect;

-- Query 1: Applicants who applied to more than 5 jobs
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
ORDER BY total_applications DESC;

-- Query 2: Jobs with no applications
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
WHERE a.application_id IS NULL
  AND j.status = 'Active'
ORDER BY j.posted_date DESC;

-- Query 3: Interview-to-Offer Conversion Rate per Recruiter
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
ORDER BY conversion_rate_percentage DESC;

-- Query 4: Offers pending acceptance for more than 14 days
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
WHERE o.status = 'Pending'
  AND DATEDIFF(CURDATE(), o.offer_date) > 14
ORDER BY days_pending DESC;

-- Query 5a: Applicants interviewed by more than 2 recruiters (Using DISTINCT and GROUP BY)
SELECT 
    a.applicant_id,
    CONCAT(a.first_name, ' ', a.last_name) AS applicant_name,
    a.email,
    COUNT(DISTINCT i.recruiter_id) AS unique_recruiters,
    GROUP_CONCAT(DISTINCT CONCAT(r.first_name, ' ', r.last_name) SEPARATOR ', ') AS recruiter_names
FROM Applicants a
INNER JOIN Applications app ON a.applicant_id = app.applicant_id
INNER JOIN Interviews i ON app.application_id = i.application_id
INNER JOIN Applicants r ON i.recruiter_id = r.applicant_id
GROUP BY a.applicant_id, a.first_name, a.last_name, a.email
HAVING COUNT(DISTINCT i.recruiter_id) > 2
ORDER BY unique_recruiters DESC;

-- Query 5b: Applicants interviewed by more than 2 recruiters (Using Subquery)
SELECT 
    a.applicant_id,
    CONCAT(a.first_name, ' ', a.last_name) AS applicant_name,
    a.email,
    (SELECT COUNT(DISTINCT i2.recruiter_id)
     FROM Applications app2
     INNER JOIN Interviews i2 ON app2.application_id = i2.application_id
     WHERE app2.applicant_id = a.applicant_id) AS unique_recruiters
FROM Applicants a
WHERE a.applicant_id IN (
    SELECT app.applicant_id
    FROM Applications app
    INNER JOIN Interviews i ON app.application_id = i.application_id
    GROUP BY app.applicant_id
    HAVING COUNT(DISTINCT i.recruiter_id) > 2
)
ORDER BY unique_recruiters DESC;

-- Additional Report Queries

-- Report 1: Top Job Categories by Number of Applications
SELECT 
    j.job_category,
    COUNT(DISTINCT a.application_id) AS total_applications,
    COUNT(DISTINCT j.job_id) AS total_jobs,
    COUNT(DISTINCT a.applicant_id) AS unique_applicants,
    ROUND(AVG(j.salary_max), 2) AS avg_max_salary
FROM Jobs j
LEFT JOIN Applications a ON j.job_id = a.job_id
GROUP BY j.job_category
ORDER BY total_applications DESC;

-- Report 2: Onboarding Completion Status
SELECT 
    CONCAT(a.first_name, ' ', a.last_name) AS applicant_name,
    j.job_title,
    c.company_name,
    COUNT(ot.task_id) AS total_tasks,
    SUM(CASE WHEN ot.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
    SUM(CASE WHEN ot.status = 'Pending' THEN 1 ELSE 0 END) AS pending_tasks,
    SUM(CASE WHEN ot.status = 'Overdue' THEN 1 ELSE 0 END) AS overdue_tasks,
    ROUND((SUM(CASE WHEN ot.status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(ot.task_id)), 2) AS completion_percentage
FROM OnboardingTasks ot
INNER JOIN Applicants a ON ot.applicant_id = a.applicant_id
INNER JOIN Offers o ON ot.offer_id = o.offer_id
INNER JOIN Jobs j ON o.job_id = j.job_id
INNER JOIN Companies c ON j.company_id = c.company_id
GROUP BY a.applicant_id, a.first_name, a.last_name, j.job_title, c.company_name
ORDER BY completion_percentage DESC;

-- Report 3: Application Pipeline Status
SELECT 
    app.status,
    COUNT(*) AS application_count,
    COUNT(DISTINCT app.applicant_id) AS unique_applicants,
    ROUND(AVG(DATEDIFF(CURDATE(), app.application_date)), 2) AS avg_days_in_status
FROM Applications app
GROUP BY app.status
ORDER BY application_count DESC;

-- Report 4: Company Hiring Performance
SELECT 
    c.company_name,
    c.industry,
    COUNT(DISTINCT j.job_id) AS total_jobs_posted,
    COUNT(DISTINCT a.application_id) AS total_applications,
    COUNT(DISTINCT i.interview_id) AS total_interviews,
    COUNT(DISTINCT o.offer_id) AS total_offers,
    ROUND((COUNT(DISTINCT o.offer_id) * 100.0 / NULLIF(COUNT(DISTINCT a.application_id), 0)), 2) AS offer_rate_percentage
FROM Companies c
LEFT JOIN Jobs j ON c.company_id = j.company_id
LEFT JOIN Applications a ON j.job_id = a.job_id
LEFT JOIN Interviews i ON a.application_id = i.application_id
LEFT JOIN Offers o ON a.application_id = o.application_id
GROUP BY c.company_id, c.company_name, c.industry
ORDER BY total_applications DESC;

-- Report 5: Interview Performance by Type
SELECT 
    i.interview_type,
    COUNT(*) AS total_interviews,
    AVG(e.overall_score) AS avg_evaluation_score,
    COUNT(DISTINCT CASE WHEN e.recommendation IN ('Strongly Recommend', 'Recommend') THEN e.evaluation_id END) AS positive_recommendations,
    ROUND((COUNT(DISTINCT CASE WHEN e.recommendation IN ('Strongly Recommend', 'Recommend') THEN e.evaluation_id END) * 100.0 / COUNT(DISTINCT e.evaluation_id)), 2) AS recommendation_rate
FROM Interviews i
LEFT JOIN Evaluations e ON i.interview_id = e.interview_id
WHERE i.status = 'Completed'
GROUP BY i.interview_type
ORDER BY avg_evaluation_score DESC;

-- Query to view JobStatistics View
SELECT * FROM JobStatistics
ORDER BY ApplicantsCount DESC;
