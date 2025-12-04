

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized: user not authenticated'
      });
    }

    const userRole = req.user.role;

    if (!userRole || !allowed.includes(userRole)) {
      return res.status(403).json({
        message: 'Forbidden: you do not have permission for this action'
      });
    }

    next();
  };
}

module.exports = requireRole;
