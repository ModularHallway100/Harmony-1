const checkRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.publicMetadata.role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
  }
  next();
};

const canModerate = (req, res, next) => {
  if (!req.user || !['admin', 'moderator'].includes(req.user.publicMetadata.role)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions for moderation' });
  }
  next();
};

module.exports = {
  checkRole,
  canModerate,
};