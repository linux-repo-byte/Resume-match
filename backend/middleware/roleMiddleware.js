/**
 * Restricts a route to one or more roles.
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 *        router.get('/staff', protect, authorize('recruiter', 'admin'), handler)
 *
 * Must be used AFTER `protect`, since it relies on req.user being set.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user context found');
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied: '${req.user.role}' role is not permitted to access this resource`
      );
    }

    next();
  };
};

module.exports = { authorize };
