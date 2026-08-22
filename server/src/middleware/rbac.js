export function requireHRAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  if (req.user.role !== 'hr_admin') {
    return res.status(403).json({
      error: 'Access denied. This action requires HR / Admin privileges.'
    });
  }

  next();
}

export function requireSelfOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const targetUserId = parseInt(req.params.id || req.params.userId || req.body.userId, 10);

  if (req.user.role === 'hr_admin' || req.user.id === targetUserId) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied. You can only view or manage your own records.'
  });
}
