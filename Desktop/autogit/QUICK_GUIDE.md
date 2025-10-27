# 🚀 Quick Guide: File Upload Limits

## ⚡ TL;DR

**GitHub API Limit: 25MB per file**

- ✅ Files ≤ 25MB → Upload via AutoGit
- ⚠️ Files > 25MB → Automatically skipped
- 💡 Large files → Use Git commands locally

---

## 📏 File Size Limits

```
┌─────────────────────────────────────────────┐
│  File Size          Method         Status   │
├─────────────────────────────────────────────┤
│  < 1MB             AutoGit         ✅ Perfect│
│  1-25MB            AutoGit         ✅ Works  │
│  25-100MB          Git Push        ⚠️ Manual │
│  > 100MB           Git LFS         ⚠️ Setup  │
└─────────────────────────────────────────────┘
```

---

## 🎯 What to Upload

### ✅ Good for AutoGit:
- Source code (`.js`, `.jsx`, `.css`, `.html`)
- Small images (< 1MB)
- Configuration files
- Documentation
- Small datasets

### ❌ Skip These:
- `node_modules/` folder
- Build artifacts (`dist/`, `build/`)
- Large videos (`.mp4`, `.mov`)
- Large archives (`.zip`, `.tar.gz`)
- Database dumps (> 25MB)

---

## 🛠️ How to Exclude Large Files

### Create `.gitignore`:
```gitignore
# Dependencies
node_modules/

# Build
dist/
build/
out/

# Large files
*.mp4
*.zip
*.tar.gz

# Environment
.env
```

---

## 💡 For Large Files

### Use Git Commands:
```bash
# 1. Clone repository
git clone https://github.com/username/repo.git

# 2. Add files
cd repo
cp /path/to/files .

# 3. Commit and push
git add .
git commit -m "Add files"
git push
```

---

## 🎊 Summary

**AutoGit is perfect for:**
- Regular source code projects
- Small to medium files
- Quick uploads

**Use Git commands for:**
- Large files (25-100MB)
- Complex projects
- Advanced Git features

**Your AutoGit now:**
- ✅ Automatically filters large files
- ✅ Shows clear warnings
- ✅ Uploads valid files
- ✅ Provides guidance

**Happy coding!** 🚀
