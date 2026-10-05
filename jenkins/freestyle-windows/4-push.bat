rem Needs credentials binding: DOCKER_USER / DOCKER_PASS (from dockerhub-creds)
echo %DOCKER_PASS%| docker login -u %DOCKER_USER% --password-stdin
if errorlevel 1 exit /b 1
docker push --quiet %IMAGE%:%BUILD_NUMBER%
if errorlevel 1 exit /b 1
docker push --quiet %IMAGE%:latest
if errorlevel 1 exit /b 1
docker logout
exit /b 0
