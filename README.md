# HireConnect Platform - Job Recruitment Management System

## Overview
A comprehensive database-driven recruitment platform demonstrating all DBMS concepts including normalization, indexing, transactions, security, and role-based access control.

## Important Note About Database
**This Replit implementation uses SQLite** due to MariaDB/MySQL installation limitations in the environment. However, **all MySQL files are provided** and ready for use:

### MySQL Files (Complete and Ready)
- `database/schema.sql` - Complete MySQL schema with all 9 tables
- `database/sample-data.sql` - Sample data for MySQL
- `database/queries.sql` - All complex queries in MySQL syntax

### Current Implementation
- Uses SQLite for demonstration in Replit
- All DBMS concepts are fully implemented and functional
- Easy to switch to MySQL (see instructions below)

## Features Implemented

### Database Design (LLD)
1. **9 Tables with Proper Relationships**
   - Companies
   - Jobs
   - Applicants
   - Resumes
   - Applications
   - Interviews
   - Evaluations
   - Offers
   - OnboardingTasks

2. **Constraints**
   - Primary Keys (AUTO_INCREMENT)
   - Foreign Keys with CASCADE/SET NULL
   - CHECK constraints (salary ≥ 15000)
   - UNIQUE constraints

3. **Normalization**
   - All tables in 3NF
   - No redundancy
   - Proper relationship modeling

### Indexing (Performance Optimization)
- Index on Applications.applicant_id
- Index on Jobs.job_id
- Index on Interviews.interview_date
- Demonstrates performance improvements for frequently queried columns

### Complex SQL Queries
1. Applicants applied to >5 jobs
2. Jobs with no applications
3. Interview-to-offer conversion rate per recruiter
4. Offers pending acceptance >14 days
5. Applicants interviewed by >2 recruiters (two implementations)
6. Job statistics view (aggregate functions)

### Reports (4+ Implemented)
1. Multiple Applications Tracker
2. Jobs with No Applications
3. Interview-to-Offer Conversion Rates
4. Pending Offers Report
5. Onboarding Completion Status
6. Top Job Categories

### Transactions
- **Offer Issuance Transaction** with automatic rollback
- Validates salary against minimum wage
- Demonstrates ACID properties
- Updates applicant status automatically

### Security Features

#### Role-Based Access Control (RBAC)
- **Admin**: Full system access
- **Recruiter**: Job posting, interviews, evaluations
- **Applicant**: Own profile and applications only
- **HR Manager**: Onboarding, reports, full data access

#### SQL Injection Prevention
- Parameterized queries throughout
- Input validation using express-validator
- Escape user input

#### Privacy (GDPR Compliance)
- Location data masking for unauthorized access
- Applicants can only view own profiles

## Quick Start

### Running the Application
1. The application is already running at the Webview
2. Click "Open in new tab" to access the full interface

### Using the Application
1. **Select a Role** - Choose from Admin, Recruiter, Applicant, or HR Manager
2. **Explore Features** - Each role has different access levels
3. **View Reports** - Navigate to the Reports section
4. **Test Security** - Try the Demo Features section

### Testing Features

#### Transaction Demo
1. Go to "Demo Features" section
2. Enter an Application ID and Salary
3. Test with salary < $15,000 to see rollback
4. Test with salary ≥ $15,000 to see success

#### SQL Injection Demo
1. Go to "Jobs" section
2. Try searching with: `' OR '1'='1`
3. System will safely handle the input

#### Privacy Demo
1. Select "Applicant" role (ID 6)
2. Click "Test Privacy Masking" in Demo section
3. See location data masked for other applicants

## Switching to MySQL

If you want to use MySQL instead of SQLite:

### Step 1: Install MySQL locally
```bash
# On macOS
brew install mysql
mysql.server start

# On Ubuntu/Debian
sudo apt-get install mysql-server
sudo systemctl start mysql

# On Windows
# Download and install from mysql.com
```

### Step 2: Create Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p hireconnect < database/sample-data.sql
```

### Step 3: Update Configuration
Replace `config/database.js` with this:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hireconnect',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
}

module.exports = { pool, initializeDatabase };
```

### Step 4: Restart Server
```bash
npm start
```

## API Endpoints

### Authentication
All endpoints require headers:
- `x-user-role`: Admin | Recruiter | Applicant | HRManager
- `x-user-id`: User's applicant_id

### Companies
- `GET /api/companies` - List all companies

### Jobs
- `GET /api/jobs?search=keyword&category=Engineering` - Search jobs (SQL injection protected)
- `POST /api/jobs` - Create job (Recruiter/Admin only)

### Applications
- `GET /api/applications` - List applications (filtered by role)
- `POST /api/applications` - Submit application (Applicant only)

### Interviews
- `GET /api/interviews` - List interviews (Recruiter/HR/Admin)
- `POST /api/interviews` - Schedule interview

### Evaluations
- `POST /api/evaluations` - Submit evaluation

### Offers
- `GET /api/offers` - List offers
- `POST /api/offers` - Create offer with transaction

### Reports
- `GET /api/reports/multiple-applications` - Applicants with >5 applications
- `GET /api/reports/jobs-no-applications` - Jobs with no applications
- `GET /api/reports/conversion-rates` - Interview-to-offer conversion
- `GET /api/reports/pending-offers` - Offers pending >14 days
- `GET /api/reports/onboarding-status` - Onboarding completion
- `GET /api/reports/job-categories` - Top job categories
- `GET /api/reports/job-statistics` - Job statistics view

## Technologies Used

### Frontend
- HTML5
- CSS3 (Gradient design, responsive layout)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- better-sqlite3 (for Replit demo) / mysql2 (for MySQL)
- bcrypt (password hashing)
- express-validator (input validation)
- cors

### Database
- SQLite (current Replit implementation)
- MySQL-compatible schema and queries provided

## Assignment Deliverables Checklist

### LLD Document Requirements ✓
- [x] Tables with attributes & keys
- [x] Relationship mappings
- [x] Normalization explanation
- [x] Indexing strategy notes
- [x] Transaction pseudo-code
- [x] Security role design

### SQL Schema & Queries ✓
- [x] DDL implementation (schema.sql)
- [x] Sample data insertion
- [x] Applicants applied to >5 jobs
- [x] Jobs with no applications
- [x] Conversion rate per recruiter
- [x] Offers pending >14 days
- [x] Applicants interviewed by >2 recruiters (2 ways)
- [x] Database view (JobStatistics)
- [x] Aggregate functions demonstrated
- [x] Joins & subqueries
- [x] 4+ reports generated

### Indexing ✓
- [x] applicant_id index
- [x] job_id index
- [x] interview_date index

### Transactions ✓
- [x] Offer issuance transaction
- [x] Rollback on invalid salary
- [x] Update applicant status

### Security ✓
- [x] 4 Roles (Admin, Recruiter, Applicant, HRManager)
- [x] RBAC implementation
- [x] SQL injection prevention
- [x] Privacy controls (GDPR location masking)

## Project Structure
```
hireconnect/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # RBAC middleware
│   └── validators.js        # SQL injection prevention
├── database/
│   ├── schema.sql           # MySQL schema (READY FOR USE)
│   ├── sample-data.sql      # MySQL sample data (READY FOR USE)
│   ├── queries.sql          # Complex queries (READY FOR USE)
│   └── init-sqlite.js       # SQLite initialization (current)
├── public/
│   ├── index.html           # Frontend interface
│   ├── styles.css           # Styling
│   └── app.js               # Frontend logic
├── server.js                # Express server
├── package.json             # Dependencies
└── README.md                # Documentation
```

## Default Users

### For Testing
- Admin: ID 1
- Recruiter: ID 2, 3, 5
- Applicant: ID 6-15
- HR Manager: ID 4

All passwords are hashed with bcrypt.

## Key Demonstrations

### 1. Database Design
- 9 normalized tables
- Proper relationships with foreign keys
- Constraints ensuring data integrity

### 2. Indexing
- Performance optimization on key columns
- Faster query execution for common operations

### 3. Complex Queries
- Multi-table joins
- Aggregate functions (COUNT, AVG, SUM)
- Subqueries and GROUP BY with HAVING
- Two different implementations for complex queries

### 4. Transactions
- ACID compliance
- Automatic rollback on constraint violation
- Multi-step operations as atomic units

### 5. Security
- RBAC preventing unauthorized access
- SQL injection protection
- Privacy controls for sensitive data

## Support

For questions or issues:
1. Check the MySQL files in `/database` folder
2. Review the API documentation above
3. Test using the Demo Features section
4. All DBMS concepts are fully implemented

---

**Note**: This project demonstrates all required DBMS concepts. The SQLite implementation is for Replit compatibility only. Complete MySQL schema and queries are provided in the `/database` folder for production use or local testing.
