docker rm -f taskboard >nul 2>&1
docker run -d --name taskboard --restart unless-stopped -p 3001:3000 -v taskboard-data:/data %IMAGE%:%BUILD_NUMBER%
if errorlevel 1 exit /b 1
docker image prune -f
exit /b 0
