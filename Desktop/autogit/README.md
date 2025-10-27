# AutoGit - Personal GitHub Upload & Learning Tracker

A full-stack MERN application that helps you track your daily learning activities and automatically upload files to GitHub repositories without manual git commands.

## 🚀 Features

- **GitHub OAuth Authentication** - Secure login with your GitHub account
- **Auto Upload to GitHub** - Upload files/folders directly to any repository
- **Learning Tracker** - Document your daily learning with tasks, descriptions, and notes
- **Dashboard** - View all tasks with filters by date, repository, and status
- **Automatic Commits** - Auto-generate commit messages and push to GitHub
- **Upload Status Tracking** - Monitor success/failure of uploads in real-time
- **Modern UI** - Beautiful interface built with React and TailwindCSS

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- TailwindCSS
- Axios
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Passport.js (GitHub OAuth)
- Octokit (GitHub REST API)
- Multer (File uploads)

## 📁 Project Structure

```
autogit/
├── backend/
│   ├── config/
│   │   └── passport.js          # GitHub OAuth configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Task.js              # Task schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── repos.js             # Repository routes
│   │   └── tasks.js             # Task routes
│   ├── utils/
│   │   └── githubUpload.js      # GitHub upload logic
│   ├── .env.example             # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                # Express server
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js        # Navigation bar
    │   │   └── PrivateRoute.js  # Protected route wrapper
    │   ├── context/
    │   │   └── AuthContext.js   # Authentication context
    │   ├── pages/
    │   │   ├── Login.js         # Login page
    │   │   ├── Dashboard.js     # Main dashboard
    │   │   ├── AddTask.js       # Create new task
    │   │   ├── TaskDetails.js   # Task details view
    │   │   └── Settings.js      # User settings
    │   ├── App.js               # Main app component
    │   ├── index.js             # Entry point
    │   └── index.css            # Global styles
    ├── .gitignore
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- GitHub Account
- GitHub OAuth App

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Fill in the details:
   - **Application name**: AutoGit
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
3. Save the **Client ID** and **Client Secret**

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Add your MongoDB URI, GitHub Client ID, and Client Secret
```

**Edit `.env` file:**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/autogit

SESSION_SECRET=your-super-secret-session-key-change-this

GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

**Create uploads directory:**
```bash
mkdir uploads
```

**Start backend server:**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

### 4. MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB and start service
mongod
```

**Option 2: MongoDB Atlas**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

## 📖 Usage

### 1. Login
- Navigate to `http://localhost:3000`
- Click "Login with GitHub"
- Authorize the application

### 2. Create a Task
- Click "Add Task" in the navbar
- Fill in task details:
  - Task title
  - Description
  - Notes (optional)
  - Select repository
  - Upload files (optional)
- Click "Create & Upload"

### 3. View Dashboard
- See all your tasks
- Filter by status, repository, or date
- Click on a task to view details
- View commit links on GitHub

### 4. Track Progress
- Monitor upload status (pending, uploading, success, failed)
- View statistics on dashboard
- Access commit history

## 🔑 API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `GET /api/auth/logout` - Logout user

### Repositories
- `GET /api/repos` - Get user's repositories
- `GET /api/repos/:owner/:repo/branches` - Get repository branches

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task and upload
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🎨 Features in Detail

### GitHub Upload Function
The `githubUpload.js` utility uses Octokit to:
1. Get current commit SHA
2. Create blobs for each file
3. Create a new tree
4. Create a new commit
5. Update the branch reference
6. Files are organized in `autogit-uploads/YYYY-MM-DD/` folders

### Authentication Flow
1. User clicks "Login with GitHub"
2. Redirected to GitHub OAuth
3. User authorizes the app
4. GitHub redirects back with code
5. Backend exchanges code for access token
6. User session is created
7. Access token stored for API calls

### File Upload Process
1. User selects files in Add Task form
2. Files uploaded to backend via Multer
3. Task created in MongoDB
4. Background process uploads to GitHub
5. Task status updated (success/failed)
6. Temporary files cleaned up

## 🚧 Optional Enhancements

### Future Features
- [ ] AI summary of uploaded tasks
- [ ] Weekly learning report generation
- [ ] Support for multiple GitHub accounts
- [ ] Rich text editor for notes
- [ ] Drag-and-drop file upload
- [ ] Export tasks to PDF/CSV
- [ ] Calendar view of tasks
- [ ] Tags and categories
- [ ] Search functionality
- [ ] Dark mode

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)

**2. GitHub OAuth Not Working**
- Verify Client ID and Secret
- Check callback URL matches OAuth app settings
- Ensure ports 3000 and 5000 are not blocked

**3. File Upload Fails**
- Check `uploads/` directory exists
- Verify file size limits (50MB default)
- Check GitHub API rate limits

**4. CORS Errors**
- Ensure backend `CLIENT_URL` matches frontend URL
- Check `withCredentials: true` in axios calls

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/autogit
SESSION_SECRET=your-secret-key
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ using MERN Stack

## 🙏 Acknowledgments

- GitHub API Documentation
- Octokit.js
- TailwindCSS
- Lucide Icons
- React Community

---

**Happy Learning & Coding! 🚀**
