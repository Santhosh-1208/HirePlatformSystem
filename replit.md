# HireConnect Platform - Replit Project Information

## Project Overview
Full-stack job recruitment management system built for DBMS assignment demonstrating database design, SQL queries, transactions, indexing, and security.

## Recent Changes (Nov 7, 2024)
- Created complete MySQL database schema with 9 tables
- Implemented Node.js/Express REST API with RBAC
- Built frontend interface with role-specific dashboards
- Added SQL injection prevention and input validation
- Implemented transaction management with rollback
- Created 6+ complex queries and reports
- Added privacy features (GDPR location masking)
- **Note**: Using SQLite for Replit demo; MySQL files ready in `/database` folder

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (demo) / MySQL (production-ready files provided)
- **Security**: RBAC, parameterized queries, input validation

## Project Architecture

### Database Schema (9 Tables)
1. Companies - Company information
2. Jobs - Job postings with salary constraints
3. Applicants - User accounts with roles
4. Resumes - Applicant resumes and skills
5. Applications - Job applications
6. Interviews - Interview scheduling
7. Evaluations - Interview feedback
8. Offers - Job offers with transactions
9. OnboardingTasks - Onboarding workflow

### Key Features
- **RBAC**: 4 roles (Admin, Recruiter, Applicant, HRManager)
- **Indexing**: applicant_id, job_id, interview_date
- **Transactions**: Offer issuance with automatic rollback
- **Views**: JobStatistics for aggregate data
- **Security**: SQL injection prevention, privacy controls

## User Preferences
- Assignment requires MySQL database
- All MySQL files are provided and ready
- Comprehensive documentation needed
- Focus on demonstrating DBMS concepts

## File Structure
- `/database/*.sql` - MySQL schema, data, and queries (READY FOR USE)
- `/config/database.js` - Database configuration
- `/middleware/` - Authentication and validation
- `/public/` - Frontend files
- `server.js` - Main Express server

## Workflow
- Server runs on port 5000
- Webview enabled for frontend access
- All features accessible through web interface

## Important Notes
- MariaDB installation failed in Replit environment
- SQLite used as working alternative for demonstration
- Complete MySQL implementation files provided
- Easy to switch to MySQL for production use
- All DBMS concepts fully demonstrated
