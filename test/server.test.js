const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createApp } = require('../server');

let server, url, dir, file;

const start = () => new Promise((resolve) => {
  const s = createApp({ dataFile: file }).listen(0, () => resolve(s));
});
const api = (p, opts = {}) => fetch(`${url}${p}`, {
  headers: { 'Content-Type': 'application/json' },
  ...opts,
  body: opts.body ? JSON.stringify(opts.body) : undefined,
});

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskboard-'));
  file = path.join(dir, 'tasks.json');
  server = await start();
  url = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test('GET /health returns 200', async () => {
  const res = await api('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ok');
});

test('create a task and list it', async () => {
  const res = await api('/api/tasks', { method: 'POST', body: { title: 'Write tests', priority: 'high' } });
  assert.strictEqual(res.status, 201);
  const task = await res.json();
  assert.strictEqual(task.status, 'todo');
  assert.strictEqual(task.priority, 'high');
  const list = await (await api('/api/tasks')).json();
  assert.ok(list.some((t) => t.id === task.id));
});

test('rejects an empty title and a bad status', async () => {
  const empty = await api('/api/tasks', { method: 'POST', body: { title: '   ' } });
  assert.strictEqual(empty.status, 400);
  const created = await (await api('/api/tasks', { method: 'POST', body: { title: 'x' } })).json();
  const bad = await api(`/api/tasks/${created.id}`, { method: 'PATCH', body: { status: 'nope' } });
  assert.strictEqual(bad.status, 400);
});

test('moving a task updates stats and survives a restart', async () => {
  const task = await (await api('/api/tasks', { method: 'POST', body: { title: 'Persist me' } })).json();
  const moved = await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: { status: 'doing' } });
  assert.strictEqual((await moved.json()).status, 'doing');
  const stats = await (await api('/api/stats')).json();
  assert.ok(stats.doing >= 1);

  server.close();                       // "restart" the app on the same data file
  server = await start();
  url = `http://localhost:${server.address().port}`;
  const list = await (await api('/api/tasks')).json();
  assert.strictEqual(list.find((t) => t.id === task.id).status, 'doing');
});

test('delete removes a task, then returns 404', async () => {
  const task = await (await api('/api/tasks', { method: 'POST', body: { title: 'Delete me' } })).json();
  assert.strictEqual((await api(`/api/tasks/${task.id}`, { method: 'DELETE' })).status, 204);
  assert.strictEqual((await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: { title: 'again' } })).status, 404);
});
