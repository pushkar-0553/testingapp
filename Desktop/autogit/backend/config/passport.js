const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            // Update access token
            user.accessToken = accessToken;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value || '',
            avatarUrl: profile.photos?.[0]?.value || '',
            accessToken: accessToken,
            profileUrl: profile.profileUrl,
            lastLogin: new Date()
          });

          done(null, user);
        } catch (error) {
          console.error('GitHub Strategy Error:', error);
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
