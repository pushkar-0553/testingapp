// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized', message: 'Please log in to continue' });
};

// Middleware to get current user
const getCurrentUser = (req, res, next) => {
  if (req.user) {
    req.currentUser = req.user;
  }
  next();
};

module.exports = {
  ensureAuthenticated,
  getCurrentUser
};
