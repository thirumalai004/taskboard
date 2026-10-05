docker build --target test -t %IMAGE%:test-%BUILD_NUMBER% .
if errorlevel 1 exit /b 1
