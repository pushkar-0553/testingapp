@echo off
echo ========================================
echo AutoGit - Installing New Features
echo ========================================
echo.

echo Installing frontend dependencies...
cd frontend
call npm install
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo New Features Added:
echo  - Rich Text Editor (TipTap)
echo  - Markdown Preview
echo  - Folder Upload
echo  - Syntax Highlighting
echo.
echo To start the app:
echo  1. Backend: cd backend ^&^& npm run dev
echo  2. Frontend: cd frontend ^&^& npm start
echo.
pause
