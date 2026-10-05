docker build -t %IMAGE%:%BUILD_NUMBER% -t %IMAGE%:latest .
if errorlevel 1 exit /b 1
