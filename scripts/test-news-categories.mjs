import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const base = process.env.QUICK_EDIT_TEST_URL || 'http://127.0.0.1:3049';
const target = new URL(base);
assert(target.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(target.hostname), 'Use an isolated local test server.');
assert.equal(target.port, '3049', 'Use only the dedicated disposable acceptance server.');
const email = process.env.LOCAL_TEST_EMAIL;
const password = process.env.LOCAL_TEST_PASSWORD;
assert(email?.startsWith('codex-quickedit-') && email.endsWith('@example.invalid') && password, 'Disposable fixture credentials required.');
const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, targetPortal: 'admin' }) });
assert(login.ok, `Fixture login failed: ${login.status}`);
const cookie = login.headers.getSetCookie().find((value) => value.startsWith('hab_session='))?.split(';')[0];
assert(cookie, 'Fixture session cookie missing.');
const headers = { Cookie: cookie, 'Content-Type': 'application/json' };
const health = await (await fetch(`${base}/api/admin/health`, { headers })).json();
assert.equal(health.user?.name, 'Local browser verification', 'Server must contain only the disposable acceptance fixture.');
if (process.env.LOCAL_TEST_RESET === '1') {
  const previous = (await (await fetch(`${base}/api/admin/content`, { headers })).json()).news;
  for (const item of previous) {
    if (!/^(?:Local (?:Announcements|Vacancies|Programs|Events|disposable announcement)|Updated local vacancy) [0-9a-f-]{36}$/.test(item.title)) continue;
    assert((await fetch(`${base}/api/admin/content?type=NEWS&id=${item.id}`, { method: 'DELETE', headers })).ok);
  }
}
const key = randomUUID();
const created = [];
async function write(method, body) {
  const response = await fetch(`${base}/api/admin/content`, { method, headers, body: JSON.stringify(body) });
  const json = await response.json();
  assert(response.ok && json.success, json.error || `Content ${method} failed.`);
  return json.item;
}
async function list(category) {
  const response = await fetch(`${base}/api/news${category ? `?category=${encodeURIComponent(category)}` : ''}`);
  assert(response.ok);
  return (await response.json()).articles;
}
for (const kind of ['Announcements', 'Vacancies', 'Programs', 'Events']) {
  const article = await write('POST', { type: 'NEWS', title: `Local ${kind} ${key}`, kind, blurb: `Disposable ${kind} notice`, content: '<p>Local notice body.</p>', isPublished: true });
  created.push(article);
}
const vacancy = created[1];
assert((await list('Vacancies')).some((item) => item.id === vacancy.id));
assert(!(await list('Announcements')).some((item) => item.id === vacancy.id));
await write('PATCH', { type: 'NEWS', id: vacancy.id, title: `Updated local vacancy ${key}`, kind: 'Announcement', isPublished: false });
assert(!(await list()).some((item) => item.id === vacancy.id), 'Draft leaked into public news.');
const draftPage = await fetch(`${base}/news/${vacancy.id}`);
const draftHtml = await draftPage.text();
// App Router can begin streaming the layout before notFound(), retaining HTTP 200.
assert(draftPage.status === 404 || draftHtml.includes('NEXT_HTTP_ERROR_FALLBACK;404'), 'Draft detail must render not found.');
assert(!draftHtml.includes(`Updated local vacancy ${key}`), 'Draft title leaked into the detail response.');
const adminItems = (await (await fetch(`${base}/api/admin/content`, { headers })).json()).news;
assert(adminItems.some((item) => item.id === vacancy.id && item.kind === 'Announcements' && item.isPublished === false));
await write('PATCH', { type: 'NEWS', id: vacancy.id, kind: 'Vacancies', isPublished: true });
const publicVacancy = (await list('Vacancies')).find((item) => item.id === vacancy.id);
assert(publicVacancy?.title.startsWith('Updated local vacancy'));
assert.equal((await fetch(`${base}/news/${vacancy.id}`)).status, 200);
const discarded = await write('POST', { type: 'NEWS', title: `Local disposable announcement ${key}`, kind: 'Announcements', isPublished: true });
const deleted = await fetch(`${base}/api/admin/content?type=NEWS&id=${discarded.id}`, { method: 'DELETE', headers });
assert(deleted.ok, 'Delete failed.');
assert(!(await list('Announcements')).some((item) => item.id === discarded.id), 'Deleted notice still public.');
const articles = await list();
assert.equal(articles.length, 4, 'The fixture must leave four published posts for browser acceptance.');
assert.deepEqual(articles.map((item) => item.id), [...created].reverse().map((item) => item.id), 'News ordering must use newest publication records first.');
for (const path of ['/news', '/news/vacancies', '/news/announcements']) assert.equal((await fetch(`${base}${path}`)).status, 200);
console.log('PASS: separate categories, Admin CRUD, draft visibility, public detail, four newest posts and category routes. Four disposable posts remain in the temporary DB for browser checks.');
