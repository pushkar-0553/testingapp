const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');
const Task = require('../models/Task');

/**
 * Upload files to GitHub repository
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Target branch
 * @param {Array} files - Array of uploaded files
 * @param {string} commitMessage - Commit message
 * @param {string} taskId - Task ID to update
 */
async function uploadToGitHub(accessToken, owner, repo, branch, files, commitMessage, taskId) {
  const octokit = new Octokit({ auth: accessToken });

  try {
    let currentCommitSha = null;
    let currentTreeSha = null;

    // Try to get the current commit SHA (may fail for empty repos)
    try {
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });
      currentCommitSha = refData.object.sha;

      // Get the current commit to get the tree SHA
      const { data: commitData } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: currentCommitSha
      });
      currentTreeSha = commitData.tree.sha;
    } catch (error) {
      // Repository is empty or branch doesn't exist - that's okay!
      console.log('Repository is empty or branch does not exist, creating first commit...');
    }

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file.path);
        const { data: blobData } = await octokit.git.createBlob({
          owner,
          repo,
          content: content.toString('base64'),
          encoding: 'base64'
        });

        // originalname now contains the full relative path for folder uploads
        return {
          path: `autogit-uploads/${new Date().toISOString().split('T')[0]}/${file.originalname}`,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        };
      })
    );

    // Create a new tree (with or without base_tree)
    const treeOptions = {
      owner,
      repo,
      tree: blobs
    };
    
    // Only add base_tree if repository has commits
    if (currentTreeSha) {
      treeOptions.base_tree = currentTreeSha;
    }

    const { data: newTree } = await octokit.git.createTree(treeOptions);

    // Create a new commit
    const commitOptions = {
      owner,
      repo,
      message: `Auto upload - ${commitMessage}`,
      tree: newTree.sha
    };

    // Only add parents if repository has commits
    if (currentCommitSha) {
      commitOptions.parents = [currentCommitSha];
    }

    const { data: newCommit } = await octokit.git.createCommit(commitOptions);

    // Update or create the reference
    if (currentCommitSha) {
      // Update existing branch
      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha
      });
    } else {
      // Create new branch
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: newCommit.sha
      });
    }

    // Update task status
    await Task.findByIdAndUpdate(taskId, {
      uploadStatus: 'success',
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
      commitSha: newCommit.sha,
      uploadDate: new Date()
    });

    // Clean up uploaded files
    await Promise.all(
      files.map(file => fs.unlink(file.path).catch(err => console.error('File cleanup error:', err)))
    );

    console.log(`✅ Successfully uploaded to ${owner}/${repo}`);
    return { success: true, commitSha: newCommit.sha };

  } catch (error) {
    console.error('GitHub upload error:', error);

    // Update task with error
    await Task.findByIdAndUpdate(taskId, {
      uploadStatus: 'failed',
      errorMessage: error.message
    });

    // Clean up uploaded files
    await Promise.all(
      files.map(file => fs.unlink(file.path).catch(err => console.error('File cleanup error:', err)))
    );

    throw error;
  }
}

/**
 * Upload folder to GitHub repository
 * @param {string} accessToken - GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Target branch
 * @param {string} folderPath - Path to folder
 * @param {string} commitMessage - Commit message
 * @param {string} taskId - Task ID to update
 */
async function uploadFolderToGitHub(accessToken, owner, repo, branch, folderPath, commitMessage, taskId) {
  const octokit = new Octokit({ auth: accessToken });

  try {
    // Get all files in folder recursively
    const files = await getAllFiles(folderPath);

    let currentCommitSha = null;
    let currentTreeSha = null;

    // Try to get the current commit SHA (may fail for empty repos)
    try {
      const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });
      currentCommitSha = refData.object.sha;

      // Get the current commit to get the tree SHA
      const { data: commitData } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: currentCommitSha
      });
      currentTreeSha = commitData.tree.sha;
    } catch (error) {
      // Repository is empty or branch doesn't exist - that's okay!
      console.log('Repository is empty or branch does not exist, creating first commit...');
    }

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (filePath) => {
        const content = await fs.readFile(filePath);
        const { data: blobData } = await octokit.git.createBlob({
          owner,
          repo,
          content: content.toString('base64'),
          encoding: 'base64'
        });

        const relativePath = path.relative(folderPath, filePath);
        return {
          path: `autogit-uploads/${new Date().toISOString().split('T')[0]}/${relativePath}`,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        };
      })
    );

    // Create a new tree (with or without base_tree)
    const treeOptions = {
      owner,
      repo,
      tree: blobs
    };
    
    // Only add base_tree if repository has commits
    if (currentTreeSha) {
      treeOptions.base_tree = currentTreeSha;
    }

    const { data: newTree } = await octokit.git.createTree(treeOptions);

    // Create a new commit
    const commitOptions = {
      owner,
      repo,
      message: `Auto upload - ${commitMessage}`,
      tree: newTree.sha
    };

    // Only add parents if repository has commits
    if (currentCommitSha) {
      commitOptions.parents = [currentCommitSha];
    }

    const { data: newCommit } = await octokit.git.createCommit(commitOptions);

    // Update or create the reference
    if (currentCommitSha) {
      // Update existing branch
      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha
      });
    } else {
      // Create new branch
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: newCommit.sha
      });
    }

    // Update task status
    await Task.findByIdAndUpdate(taskId, {
      uploadStatus: 'success',
      commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
      commitSha: newCommit.sha,
      uploadDate: new Date()
    });

    console.log(`✅ Successfully uploaded folder to ${owner}/${repo}`);
    return { success: true, commitSha: newCommit.sha };

  } catch (error) {
    console.error('GitHub folder upload error:', error);

    // Update task with error
    await Task.findByIdAndUpdate(taskId, {
      uploadStatus: 'failed',
      errorMessage: error.message
    });

    throw error;
  }
}

/**
 * Get all files in a directory recursively
 */
async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      arrayOfFiles = await getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  }

  return arrayOfFiles;
}

module.exports = {
  uploadToGitHub,
  uploadFolderToGitHub
};
