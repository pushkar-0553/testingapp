const express = require('express');
const { Octokit } = require('@octokit/rest');
const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/repos
// @desc    Get user's GitHub repositories
// @access  Private
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const octokit = new Octokit({
      auth: req.user.accessToken
    });

    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });

    const repos = data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      description: repo.description,
      url: repo.html_url,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at
    }));

    res.json({ repositories: repos });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repositories', 
      message: error.message 
    });
  }
});

// @route   GET /api/repos/:owner/:repo/branches
// @desc    Get repository branches
// @access  Private
router.get('/:owner/:repo/branches', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const octokit = new Octokit({
      auth: req.user.accessToken
    });

    const { data } = await octokit.repos.listBranches({
      owner,
      repo
    });

    const branches = data.map(branch => ({
      name: branch.name,
      protected: branch.protected
    }));

    res.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ 
      error: 'Failed to fetch branches', 
      message: error.message 
    });
  }
});

module.exports = router;
