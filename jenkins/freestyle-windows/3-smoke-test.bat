docker rm -f smoke-%BUILD_NUMBER% >nul 2>&1
docker run -d --name smoke-%BUILD_NUMBER% %IMAGE%:%BUILD_NUMBER%
if errorlevel 1 exit /b 1
set /a TRIES=0

:retry
docker exec smoke-%BUILD_NUMBER% wget -q --spider http://localhost:3000/health
if not errorlevel 1 goto ok
set /a TRIES+=1
if %TRIES% GEQ 10 goto fail
ping -n 3 127.0.0.1 >nul
goto retry

:ok
echo Health check passed
docker rm -f smoke-%BUILD_NUMBER%
exit /b 0

:fail
echo Health check failed
docker logs smoke-%BUILD_NUMBER%
docker rm -f smoke-%BUILD_NUMBER%
exit /b 1
