function checkRole(allowedRoles) {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];
        const userId = req.headers['x-user-id'];
        
        if (!userRole || !userId) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please provide x-user-role and x-user-id headers' 
            });
        }
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                error: 'Forbidden',
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
            });
        }
        
        req.user = {
            id: parseInt(userId),
            role: userRole
        };
        
        next();
    };
}

function canViewProfile(req, res, next) {
    const requestedApplicantId = parseInt(req.params.applicantId || req.params.id);
    const userRole = req.user.role;
    const userId = req.user.id;
    
    if (userRole === 'Applicant' && requestedApplicantId !== userId) {
        return res.status(403).json({ 
            error: 'Forbidden',
            message: 'Applicants can only view their own profile' 
        });
    }
    
    next();
}

module.exports = { checkRole, canViewProfile };
