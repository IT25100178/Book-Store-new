@echo off
echo =============================================
echo   Luxury Books Java Backend - Build Script
echo =============================================

:: Create output directory
if not exist "out" mkdir out

:: Compile all Java source files
echo Compiling Java source files...
javac -d out -sourcepath src ^
  src\com\bookstore\*.java ^
  src\com\bookstore\models\*.java ^
  src\com\bookstore\storage\*.java ^
  src\com\bookstore\services\*.java ^
  src\com\bookstore\server\*.java ^
  src\com\bookstore\handlers\*.java

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Compilation failed. Please check the errors above.
    pause
    exit /b 1
)

echo.
echo [OK] Compilation successful!
echo.
echo Starting server on http://localhost:8080 ...
echo Press Ctrl+C to stop.
echo.

:: Run the server (from Back-end directory so relative paths work)
java -cp out com.bookstore.Main

pause
