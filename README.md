# TaskBoard: Jenkins + Docker CI/CD

Kanban task board: Express REST API + JSON-file persistence + single-page UI.
Data lives on a Docker volume, so tasks survive container restarts and redeploys.

## Layout
```
taskboard/
├── server.js                 # REST API + static files (/health, /api/tasks, /api/stats)
├── public/index.html         # board UI
├── test/server.test.js       # unit tests (node:test, no extra deps)
├── package.json
├── Dockerfile                # deps -> test -> prod-deps -> runtime (non-root, /data volume)
├── Jenkinsfile               # Linux agents (sh)
├── Jenkinsfile.windows       # Windows Jenkins (bat)
├── docker-compose.yml
└── jenkins/freestyle-windows/   # 1..5 .bat steps for a Freestyle job
```

## Run locally
```bash
npm install
npm test
npm start            # http://localhost:3000
```

## API
| Method | Path | Body |
|---|---|---|
| GET | /api/tasks | |
| POST | /api/tasks | `{ "title": "...", "priority": "low|medium|high" }` |
| PATCH | /api/tasks/:id | `{ "title"?, "status"?: "todo|doing|done", "priority"? }` |
| DELETE | /api/tasks/:id | |
| GET | /api/stats | |
| GET | /health | |

## Jenkins
- Freestyle: parameter `IMAGE=thirudocker004/taskboard`, bind `dockerhub-creds` as `DOCKER_USER`/`DOCKER_PASS`, paste the five .bat files in order.
- Pipeline: Script Path `Jenkinsfile.windows` (Windows) or `Jenkinsfile` (Linux).
- Deploys on **port 3001** so it can run beside the Relay chat app (3000).

## Check persistence
```bash
docker exec taskboard whoami                 # node
docker rm -f taskboard                       # remove container, keep volume
docker run -d --name taskboard -p 3001:3000 -v taskboard-data:/data thirudocker004/taskboard:latest
```
Your tasks are still there.
