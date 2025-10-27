const express = require('express');
const passport = require('passport');
const router = express.Router();

// @route   GET /api/auth/github
// @desc    Initiate GitHub OAuth
// @access  Public
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email', 'repo'] 
}));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect(process.env.CLIENT_URL + '/dashboard');
  }
);

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user._id,
        githubId: req.user.githubId,
        username: req.user.username,
        displayName: req.user.displayName,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        profileUrl: req.user.profileUrl
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// @route   GET /api/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
