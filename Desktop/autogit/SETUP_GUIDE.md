# AutoGit - Quick Setup Guide

## Step-by-Step Setup Instructions

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
1. Install MongoDB from [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string

### Step 3: Create GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Application name**: AutoGit
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click "Register application"
5. Copy **Client ID** and generate **Client Secret**

### Step 4: Configure Environment Variables

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Copy example env file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   
   # MongoDB URI (choose one)
   # Local:
   MONGODB_URI=mongodb://localhost:27017/autogit
   # OR Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autogit
   
   SESSION_SECRET=my-super-secret-session-key-12345
   
   # GitHub OAuth (paste your values)
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
   ```

### Step 5: Create Uploads Directory

```bash
cd backend
mkdir uploads
```

### Step 6: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Browser will automatically open at `http://localhost:3000`

### Step 7: Test the Application

1. Click "Login with GitHub"
2. Authorize the application
3. You'll be redirected to the dashboard
4. Click "Add Task" to create your first task
5. Upload a file and select a repository
6. Click "Create & Upload"
7. Check your GitHub repository for the uploaded files!

## Verification Checklist

- [ ] MongoDB is running and connected
- [ ] Backend server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] GitHub OAuth app is created
- [ ] Environment variables are configured
- [ ] Can login with GitHub
- [ ] Can see repositories in Add Task page
- [ ] Can create and upload tasks

## Common Issues & Solutions

### Issue: "MongoDB connection error"
**Solution:** 
- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and credentials

### Issue: "GitHub OAuth fails"
**Solution:**
- Verify Client ID and Secret in `.env`
- Check callback URL matches OAuth app settings
- Clear browser cookies and try again

### Issue: "Cannot upload files"
**Solution:**
- Ensure `uploads/` directory exists in backend
- Check file size (max 50MB)
- Verify GitHub token has `repo` scope

### Issue: "CORS error"
**Solution:**
- Ensure `CLIENT_URL` in backend `.env` is `http://localhost:3000`
- Check `withCredentials: true` in frontend axios calls

### Issue: "Port already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

## Production Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables in platform
2. Change `CLIENT_URL` to your frontend URL
3. Update GitHub OAuth callback URL
4. Use MongoDB Atlas for database

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `build/` folder
3. Update backend CORS settings

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review API endpoints and features
- Check GitHub Issues for known problems

---

**You're all set! Start tracking your learning journey! 🚀**
