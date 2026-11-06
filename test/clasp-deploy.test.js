// Tests the setup script against a fake clasp. Real sign-in and deployment need a school account.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { setup, update, webAppUrl, SetupError } = require('../dev/clasp-deploy');

const MANIFEST = '{"webapp":{"access":"DOMAIN"}}';
const OK = { ok: true, stdout: '', stderr: '' };

function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src', 'appsscript.json'), MANIFEST);
  return root;
}

function fakeClasp({ email = 'teacher@school.test', loggedIn = true, fail = null } = {}) {
  const calls = [];
  const clasp = (args, opts = {}) => {
    const name = args[0];
    calls.push({ name, args, cwd: opts.cwd });
    if (name === fail) return { ok: false, stdout: '', stderr: 'User has not enabled the Apps Script API.' };
    if (name === 'show-authorized-user') {
      return { ...OK, stdout: JSON.stringify({ loggedIn, email: loggedIn ? email : undefined }) };
    }
    if (name === 'login') { loggedIn = true; return OK; }
    if (name === 'logout') { loggedIn = false; return OK; }
    if (name === 'create-script') {
      // Behaves like the real clasp, which replaces any manifest in its folder.
      fs.writeFileSync(path.join(opts.cwd, 'appsscript.json'), '{}');
      return { ...OK, stdout: '{"scriptId":"SCRIPT-1"}' };
    }
    if (name === 'create-deployment') return { ...OK, stdout: '{"deploymentId":"DEPLOY-1"}' };
    if (name === 'update-deployment') return { ...OK, stdout: '{"deploymentId":"DEPLOY-1"}' };
    if (name === 'push') return { ...OK, stdout: '["src/Code.gs"]' };
    return OK;
  };
  clasp.names = () => calls.map((c) => c.name);
  clasp.call = (name) => calls.find((c) => c.name === name);
  return clasp;
}

const yes = async () => true;
const quiet = () => {};
const read = (root, file) => fs.readFileSync(path.join(root, file), 'utf8');

test('setup creates, uploads and deploys in that order and saves the IDs', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await setup({ clasp, ask: yes, log: quiet, root });
  const names = clasp.names();
  assert.ok(names.indexOf('create-script') < names.indexOf('push'));
  assert.ok(names.indexOf('push') < names.indexOf('create-deployment'));
  assert.deepStrictEqual(JSON.parse(read(root, '.clasp.json')), { scriptId: 'SCRIPT-1', rootDir: 'src' });
  assert.strictEqual(JSON.parse(read(root, '.deployment.json')).deploymentId, 'DEPLOY-1');
});

const titleSent = (clasp) => {
  const { args } = clasp.call('create-script');
  return args[args.indexOf('--title') + 1];
};

test('setup names the project as the teacher asks', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await setup({ clasp, ask: yes, askText: async () => ' 9XY My Course ', log: quiet, root });
  assert.strictEqual(titleSent(clasp), '9XY My Course');
});

test('pressing Enter uses the default project name', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await setup({ clasp, ask: yes, askText: async () => '   ', log: quiet, root });
  assert.strictEqual(titleSent(clasp), 'Computing Foundations');
});

test('a project name that could break the command is refused before anything is created', async (t) => {
  const root = project(t);
  for (const name of ['x" & del *', 'a;b', '$(x)', 'x'.repeat(81)]) {
    const clasp = fakeClasp();
    await assert.rejects(setup({ clasp, ask: yes, askText: async () => name, log: quiet, root }), SetupError);
    assert.ok(!clasp.names().includes('create-script'));
  }
});

test('a project that already exists is not renamed or asked about', async (t) => {
  const root = project(t);
  fs.writeFileSync(path.join(root, '.clasp.json'), '{"scriptId":"SCRIPT-1","rootDir":"src"}');
  const clasp = fakeClasp();
  const askText = async () => { throw new Error('should not ask for a name'); };
  await setup({ clasp, ask: yes, askText, log: quiet, root });
  assert.ok(!clasp.names().includes('create-script'));
});

test('setup never lets clasp replace the manifest in src', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await setup({ clasp, ask: yes, log: quiet, root });
  assert.strictEqual(read(root, 'src/appsscript.json'), MANIFEST);
  assert.notStrictEqual(path.resolve(clasp.call('create-script').cwd), path.resolve(root));
  assert.ok(!fs.existsSync(clasp.call('create-script').cwd), 'temporary folder is removed');
});

test('uploading forces the manifest so the deployment settings are sent', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await setup({ clasp, ask: yes, log: quiet, root });
  assert.deepStrictEqual(clasp.call('push').args, ['push', '--force', '--json', '--project', root]);
});

test('every project command names its folder, so an old .clasp.json elsewhere is ignored', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await setup({ clasp, ask: yes, log: quiet, root });
  await update({ clasp, log: quiet, root });
  const projectFolder = (name) => {
    const { args } = clasp.call(name);
    return args[args.indexOf('--project') + 1];
  };
  assert.strictEqual(projectFolder('create-script'), clasp.call('create-script').cwd);
  ['push', 'create-deployment', 'update-deployment'].forEach((name) => {
    assert.strictEqual(projectFolder(name), root);
  });
});

test('a clasp failure reported as success stops the script and shows the message', async (t) => {
  const root = project(t);
  const silentFailure = (args, opts) => (args[0] === 'create-script'
    ? { ok: true, stdout: '', stderr: 'Project file already exists.' }
    : fakeClasp()(args, opts));
  await assert.rejects(setup({ clasp: silentFailure, ask: yes, log: quiet, root }), /Project file already exists/);
  assert.ok(!fs.existsSync(path.join(root, '.clasp.json')));
  assert.ok(!fs.existsSync(path.join(root, '.deployment.json')));
});

test('an upload that gives no reply stops before anything is deployed', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  const noUploadReply = (args, opts) => (args[0] === 'push' ? OK : clasp(args, opts));
  await assert.rejects(setup({ clasp: noUploadReply, ask: yes, log: quiet, root }), /Uploading the files failed/);
  assert.ok(!clasp.names().includes('create-deployment'));
});

test('setup signs in when nobody is signed in', async (t) => {
  const root = project(t);
  const clasp = fakeClasp({ loggedIn: false });
  await setup({ clasp, ask: yes, log: quiet, root });
  assert.ok(clasp.names().includes('login'));
});

test('saying no to the signed-in account signs out and starts again', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await setup({ clasp, ask: async () => false, log: quiet, root });
  const names = clasp.names();
  assert.ok(names.indexOf('logout') < names.indexOf('login'));
  assert.ok(names.indexOf('login') < names.indexOf('create-script'));
});

test('a personal Google account is refused before anything is created', async (t) => {
  const root = project(t);
  const clasp = fakeClasp({ email: 'someone@gmail.com' });
  await assert.rejects(setup({ clasp, ask: yes, log: quiet, root }), SetupError);
  assert.ok(!clasp.names().includes('create-script'));
});

test('setup retried after a failed deployment reuses the project', async (t) => {
  const root = project(t);
  await assert.rejects(
    setup({ clasp: fakeClasp({ fail: 'create-deployment' }), ask: yes, log: quiet, root }),
    /Apps Script API is turned off/
  );
  assert.ok(!fs.existsSync(path.join(root, '.deployment.json')));
  const retry = fakeClasp();
  await setup({ clasp: retry, ask: yes, log: quiet, root });
  assert.ok(!retry.names().includes('create-script'));
  assert.ok(retry.names().includes('create-deployment'));
});

test('setup refuses to run twice, so a second deployment URL is never made', async (t) => {
  const root = project(t);
  await setup({ clasp: fakeClasp(), ask: yes, log: quiet, root });
  const again = fakeClasp();
  await assert.rejects(setup({ clasp: again, ask: yes, log: quiet, root }), /npm run update/);
  assert.deepStrictEqual(again.names(), []);
});

test('update uploads and updates the saved deployment', async (t) => {
  const root = project(t);
  await setup({ clasp: fakeClasp(), ask: yes, log: quiet, root });
  const clasp = fakeClasp();
  await update({ clasp, log: quiet, root });
  assert.deepStrictEqual(clasp.names(), ['push', 'update-deployment']);
  assert.strictEqual(clasp.call('update-deployment').args[1], 'DEPLOY-1');
});

test('update before setup explains what to do', async (t) => {
  const root = project(t);
  const clasp = fakeClasp();
  await assert.rejects(update({ clasp, log: quiet, root }), /npm run setup/);
  assert.deepStrictEqual(clasp.names(), []);
});

test('update refuses a damaged deployment ID', async (t) => {
  const root = project(t);
  await setup({ clasp: fakeClasp(), ask: yes, log: quiet, root });
  fs.writeFileSync(path.join(root, '.deployment.json'), '{"deploymentId":"x & del *"}');
  const clasp = fakeClasp();
  await assert.rejects(update({ clasp, log: quiet, root }), SetupError);
  assert.deepStrictEqual(clasp.names(), []);
});

test('the web app URL uses the school domain when it is known', () => {
  assert.strictEqual(webAppUrl('ID', 'a@school.test'), 'https://script.google.com/a/macros/school.test/s/ID/exec');
  assert.strictEqual(webAppUrl('ID'), 'https://script.google.com/macros/s/ID/exec');
});

test('files holding a teacher\'s IDs are ignored by Git', () => {
  const lines = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8').split(/\r?\n/);
  assert.ok(lines.includes('.clasp.json'));
  assert.ok(lines.includes('.deployment.json'));
});
