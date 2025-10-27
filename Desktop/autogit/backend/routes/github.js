const express = require('express');
const { Octokit } = require('@octokit/rest');
const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/github/create-repo
// @desc    Create a new GitHub repository
// @access  Private
router.post('/create-repo', ensureAuthenticated, async (req, res) => {
  try {
    const { name, description, private: isPrivate, autoInit } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Repository name is required' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.createForAuthenticatedUser({
      name,
      description: description || '',
      private: isPrivate || false,
      auto_init: autoInit || true
    });

    res.json({ 
      success: true,
      repository: response.data,
      message: `Repository '${name}' created successfully!`
    });
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ 
      error: 'Failed to create repository',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   DELETE /api/github/delete-repo
// @desc    Delete a GitHub repository
// @access  Private
router.delete('/delete-repo', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo } = req.body;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo name are required' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    await octokit.repos.delete({
      owner,
      repo
    });

    res.json({ 
      success: true,
      message: `Repository '${owner}/${repo}' deleted successfully!`
    });
  } catch (error) {
    console.error('Error deleting repository:', error);
    res.status(500).json({ 
      error: 'Failed to delete repository',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   GET /api/github/repo-contents
// @desc    Get repository contents (files and folders)
// @access  Private
router.get('/repo-contents', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo, path = '' } = req.query;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo name are required' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    res.json({ 
      success: true,
      contents: response.data
    });
  } catch (error) {
    console.error('Error fetching repo contents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repository contents',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   GET /api/github/file-content
// @desc    Get file content from repository
// @access  Private
router.get('/file-content', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo, path } = req.query;
    
    if (!owner || !repo || !path) {
      return res.status(400).json({ error: 'Owner, repo, and path are required' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path
    });

    // Decode base64 content
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

    res.json({ 
      success: true,
      content,
      sha: response.data.sha,
      file: response.data
    });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ 
      error: 'Failed to fetch file content',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   PUT /api/github/update-file
// @desc    Update file in repository
// @access  Private
router.put('/update-file', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo, path, content, message, sha, branch } = req.body;
    
    if (!owner || !repo || !path || !content || !message || !sha) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: branch || 'main'
    });

    res.json({ 
      success: true,
      commit: response.data.commit,
      message: `File '${path}' updated successfully!`
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ 
      error: 'Failed to update file',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   POST /api/github/create-file
// @desc    Create new file in repository
// @access  Private
router.post('/create-file', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo, path, content, message, branch } = req.body;
    
    if (!owner || !repo || !path || !content || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch: branch || 'main'
    });

    res.json({ 
      success: true,
      commit: response.data.commit,
      message: `File '${path}' created successfully!`
    });
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ 
      error: 'Failed to create file',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   DELETE /api/github/delete-file
// @desc    Delete file from repository
// @access  Private
router.delete('/delete-file', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo, path, message, sha, branch } = req.body;
    
    if (!owner || !repo || !path || !message || !sha) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
      branch: branch || 'main'
    });

    res.json({ 
      success: true,
      commit: response.data.commit,
      message: `File '${path}' deleted successfully!`
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   GET /api/github/branches
// @desc    Get all branches of a repository
// @access  Private
router.get('/branches', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo } = req.query;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo name are required' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.listBranches({
      owner,
      repo
    });

    res.json({ 
      success: true,
      branches: response.data
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ 
      error: 'Failed to fetch branches',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   POST /api/github/create-branch
// @desc    Create a new branch
// @access  Private
router.post('/create-branch', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo, branch, from_branch } = req.body;
    
    if (!owner || !repo || !branch) {
      return res.status(400).json({ error: 'Owner, repo, and branch name are required' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    // Get the SHA of the branch to create from
    const refResponse = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${from_branch || 'main'}`
    });

    // Create new branch
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: refResponse.data.object.sha
    });

    res.json({ 
      success: true,
      message: `Branch '${branch}' created successfully!`
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ 
      error: 'Failed to create branch',
      message: error.response?.data?.message || error.message
    });
  }
});

// @route   GET /api/github/commits
// @desc    Get commit history
// @access  Private
router.get('/commits', ensureAuthenticated, async (req, res) => {
  try {
    const { owner, repo, branch, per_page = 10 } = req.query;
    
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo name are required' });
    }

    const octokit = new Octokit({ auth: req.user.accessToken });

    const response = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branch || 'main',
      per_page: parseInt(per_page)
    });

    res.json({ 
      success: true,
      commits: response.data
    });
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ 
      error: 'Failed to fetch commits',
      message: error.response?.data?.message || error.message
    });
  }
});

module.exports = router;
