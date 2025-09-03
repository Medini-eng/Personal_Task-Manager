@echo off
echo Starting Task Manager Application...

:: Check MongoDB installation in multiple possible locations
echo Checking MongoDB...
set "MONGODB_FOUND=0"

:: Check Program Files location
if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
    set "MONGODB_PATH=C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
    set "MONGODB_FOUND=1"
    goto :start_mongodb
)

:: Check Program Files (x86) location
if exist "C:\Program Files (x86)\MongoDB\Server\8.0\bin\mongod.exe" (
    set "MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\8.0\bin\mongod.exe"
    set "MONGODB_FOUND=1"
    goto :start_mongodb
)

:: Check if MongoDB is in PATH
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    set "MONGODB_PATH=mongod"
    set "MONGODB_FOUND=1"
    goto :start_mongodb
)

if %MONGODB_FOUND% equ 0 (
    echo MongoDB installation not found.
    echo.
    echo Please verify your MongoDB installation:
    echo 1. Open Command Prompt as Administrator
    echo 2. Type: mongod --version
    echo 3. If you see a version number, MongoDB is installed
    echo.
    echo If MongoDB is installed but not found, please:
    echo 1. Uninstall MongoDB
    echo 2. Download MongoDB from: https://www.mongodb.com/try/download/community
    echo 3. Run the installer and choose "Complete" installation
    echo 4. Make sure to check "Add MongoDB to PATH"
    echo.
    pause
    exit /b
)

:start_mongodb
echo Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB service is not running. Starting it now...
    "%MONGODB_PATH%" --install >nul 2>&1
    net start MongoDB >nul 2>&1
)

:: Start the backend server
echo Starting Backend Server...
start cmd /k "cd server && node server.js"

:: Wait for backend to start
timeout /t 5

:: Start the frontend server
echo Starting Frontend Server...
start cmd /k "npm start"

:: Open the application in default browser
timeout /t 10
start http://localhost:3000

echo Application started successfully!
echo Backend running on: http://localhost:5000
echo Frontend running on: http://localhost:3000 