const moderator = (req, res, next) => {
  if (req.user.role !== 'moderator') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Moderator privileges required.'
    });
  }
  next();
};

module.exports = moderator; 