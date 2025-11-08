let currentRole = null;
let currentUserId = null;

const API_BASE = '/api';

function setRole(role, userId) {
    currentRole = role;
    currentUserId = userId;
    document.getElementById('current-role').innerHTML = `Current Role: <strong>${role}</strong> (ID: ${userId})`;
    
    loadDashboard();
    showNotification(`Switched to ${role} role`, 'success');
}

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${section}-section`).classList.add('active');
    event.target.classList.add('active');
    
    if (section === 'dashboard') loadDashboard();
    if (section === 'jobs') loadJobs();
    if (section === 'applications') loadApplications();
}

async function apiCall(endpoint, options = {}) {
    if (!currentRole) {
        showNotification('Please select a role first', 'error');
        return null;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'x-user-role': currentRole,
        'x-user-id': currentUserId,
        ...options.headers
    };
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showNotification(data.message || data.error || 'Request failed', 'error');
            return null;
        }
        
        return data;
    } catch (error) {
        showNotification('Network error: ' + error.message, 'error');
        return null;
    }
}

async function loadDashboard() {
    const jobs = await apiCall('/jobs?status=Active');
    const applications = await apiCall('/applications');
    
    document.getElementById('total-jobs').textContent = jobs ? jobs.length : '0';
    document.getElementById('total-applications').textContent = applications ? applications.length : '0';
    
    if (currentRole !== 'Applicant') {
        const interviews = await apiCall('/interviews');
        const offers = await apiCall('/offers');
        
        document.getElementById('total-interviews').textContent = interviews ? interviews.length : '0';
        document.getElementById('total-offers').textContent = offers ? offers.length : '0';
    }
    
    const stats = await apiCall('/reports/job-statistics');
    if (stats) {
        displayJobStatistics(stats);
    }
}

function displayJobStatistics(stats) {
    const container = document.getElementById('job-statistics');
    
    if (!stats || stats.length === 0) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Applicants</th>
                    <th>Offers Made</th>
                    <th>Avg Score</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${stats.map(job => `
                    <tr>
                        <td>${job.job_title}</td>
                        <td>${job.company_name}</td>
                        <td>${job.job_category}</td>
                        <td>${job.ApplicantsCount}</td>
                        <td>${job.OffersMade}</td>
                        <td>${parseFloat(job.AvgEvaluationScore).toFixed(2)}</td>
                        <td><span class="status-badge">${job.JobStatus}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function loadJobs() {
    const jobs = await apiCall('/jobs?status=Active');
    const container = document.getElementById('jobs-list');
    
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p>No jobs available</p>';
        return;
    }
    
    const html = jobs.map(job => `
        <div class="job-card">
            <h3 class="job-title">${job.job_title}</h3>
            <p class="company-name">${job.company_name}</p>
            <div class="job-details">
                <p><strong>Category:</strong> ${job.job_category}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Type:</strong> ${job.employment_type}</p>
                <p><strong>Experience:</strong> ${job.experience_required}</p>
                <div class="salary-range">
                    Salary: $${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

async function searchJobs() {
    const search = document.getElementById('job-search').value;
    const category = document.getElementById('job-category').value;
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const jobs = await apiCall(`/jobs?${params.toString()}`);
    const container = document.getElementById('jobs-list');
    
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p>No jobs found matching your criteria</p>';
        return;
    }
    
    const html = jobs.map(job => `
        <div class="job-card">
            <h3 class="job-title">${job.job_title}</h3>
            <p class="company-name">${job.company_name}</p>
            <div class="job-details">
                <p><strong>Category:</strong> ${job.job_category}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p>${job.job_description ? job.job_description.substring(0, 150) + '...' : ''}</p>
                <div class="salary-range">
                    Salary: $${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

async function loadApplications() {
    const applications = await apiCall('/applications');
    const container = document.getElementById('applications-list');
    
    if (!applications || applications.length === 0) {
        container.innerHTML = '<p>No applications found</p>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    ${currentRole !== 'Applicant' ? '<th>Applicant</th>' : ''}
                    <th>Application Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${applications.map(app => `
                    <tr>
                        <td>${app.job_title}</td>
                        <td>${app.company_name}</td>
                        ${currentRole !== 'Applicant' ? `<td>${app.applicant_name}</td>` : ''}
                        <td>${new Date(app.application_date).toLocaleDateString()}</td>
                        <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function loadReport(reportType) {
    const container = document.getElementById('report-content');
    container.innerHTML = '<p>Loading report...</p>';
    
    const data = await apiCall(`/reports/${reportType}`);
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available for this report</p>';
        return;
    }
    
    let html = '';
    
    switch(reportType) {
        case 'multiple-applications':
            html = generateMultipleApplicationsReport(data);
            break;
        case 'jobs-no-applications':
            html = generateNoApplicationsReport(data);
            break;
        case 'conversion-rates':
            html = generateConversionRatesReport(data);
            break;
        case 'pending-offers':
            html = generatePendingOffersReport(data);
            break;
        case 'onboarding-status':
            html = generateOnboardingReport(data);
            break;
        case 'job-categories':
            html = generateJobCategoriesReport(data);
            break;
    }
    
    container.innerHTML = html;
}

function generateMultipleApplicationsReport(data) {
    return `
        <h3>Applicants with More Than 5 Applications</h3>
        <table>
            <thead>
                <tr>
                    <th>Applicant Name</th>
                    <th>Email</th>
                    <th>Total Applications</th>
                    <th>Applied Jobs</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td>${row.applicant_name}</td>
                        <td>${row.email}</td>
                        <td><strong>${row.total_applications}</strong></td>
                        <td>${row.applied_jobs}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateNoApplicationsReport(data) {
    return `
        <h3>Jobs with No Applications</h3>
        <table>
            <thead>
                <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Days Posted</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td>${row.job_title}</td>
                        <td>${row.company_name}</td>
                        <td>${row.job_category}</td>
                        <td>${row.location}</td>
                        <td>${row.days_posted} days</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateConversionRatesReport(data) {
    return `
        <h3>Interview-to-Offer Conversion Rates by Recruiter</h3>
        <table>
            <thead>
                <tr>
                    <th>Recruiter Name</th>
                    <th>Total Interviews</th>
                    <th>Total Offers</th>
                    <th>Conversion Rate</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td>${row.recruiter_name}</td>
                        <td>${row.total_interviews}</td>
                        <td>${row.total_offers}</td>
                        <td><strong>${row.conversion_rate_percentage || 0}%</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generatePendingOffersReport(data) {
    return `
        <h3>Offers Pending Acceptance for More Than 14 Days</h3>
        <table>
            <thead>
                <tr>
                    <th>Applicant</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Salary</th>
                    <th>Days Pending</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td>${row.applicant_name}</td>
                        <td>${row.job_title}</td>
                        <td>${row.company_name}</td>
                        <td>$${parseFloat(row.salary_offered).toLocaleString()}</td>
                        <td><strong>${row.days_pending} days</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateOnboardingReport(data) {
    return `
        <h3>Onboarding Completion Status</h3>
        <table>
            <thead>
                <tr>
                    <th>Applicant</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Total Tasks</th>
                    <th>Completed</th>
                    <th>Pending</th>
                    <th>Completion %</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td>${row.applicant_name}</td>
                        <td>${row.job_title}</td>
                        <td>${row.company_name}</td>
                        <td>${row.total_tasks}</td>
                        <td>${row.completed_tasks}</td>
                        <td>${row.pending_tasks}</td>
                        <td><strong>${row.completion_percentage}%</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateJobCategoriesReport(data) {
    return `
        <h3>Top Job Categories by Applications</h3>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Total Jobs</th>
                    <th>Total Applications</th>
                    <th>Unique Applicants</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        <td><strong>${row.job_category}</strong></td>
                        <td>${row.total_jobs}</td>
                        <td>${row.total_applications}</td>
                        <td>${row.unique_applicants}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function testTransaction() {
    const appId = document.getElementById('demo-app-id').value;
    const salary = document.getElementById('demo-salary').value;
    
    const result = await apiCall('/offers', {
        method: 'POST',
        body: JSON.stringify({
            application_id: parseInt(appId),
            salary_offered: parseFloat(salary),
            benefits: 'Test benefits',
            start_date: '2025-02-01',
            expiry_date: '2025-01-31 23:59:59'
        })
    });
    
    const resultBox = document.getElementById('transaction-result');
    
    if (result) {
        resultBox.className = 'result-box success';
        resultBox.innerHTML = `<strong>Success!</strong> ${result.message}<br>Offer ID: ${result.offer_id}<br>Transaction: ${result.transaction}`;
    } else {
        resultBox.className = 'result-box error';
        resultBox.innerHTML = `<strong>Failed!</strong> Transaction was rolled back. Check if salary is below minimum wage ($15,000).`;
    }
}

async function testPrivacy() {
    const applicantId = currentRole === 'Applicant' ? 7 : 6;
    
    const result = await apiCall(`/applicants/${applicantId}`);
    
    const resultBox = document.getElementById('privacy-result');
    
    if (result) {
        resultBox.className = 'result-box success';
        const locationText = result.location === '***MASKED***' 
            ? '<strong style="color: red;">MASKED (Privacy Protection Active)</strong>'
            : result.location;
        resultBox.innerHTML = `
            <strong>Privacy Test Result:</strong><br>
            Name: ${result.first_name} ${result.last_name}<br>
            Email: ${result.email}<br>
            Location: ${locationText}<br>
            <br>
            ${result.location === '***MASKED***' 
                ? 'Location data is masked because you are viewing another applicant\'s profile.' 
                : 'Location data is visible (authorized access).'}
        `;
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

setRole('Admin', 1);
