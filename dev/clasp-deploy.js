// Sets up and updates a teacher's own copy of the app using Google's clasp tool.
//   npm run setup    Sign in, create the Apps Script project, upload the files and deploy
//   npm run update   Upload changed files and update the deployment, keeping the same URL
//
// .clasp.json and .deployment.json hold this teacher's IDs. Both are ignored by Git and
// must stay out of the public repository.
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const CLASP = 'npx --yes @google/clasp@3.2.0';
const MIN_NODE = 20;
const DEFAULT_TITLE = 'Computing Foundations';
const API_SETTINGS_URL = 'https://script.google.com/home/usersettings';
const PERSONAL_DOMAINS = ['gmail.com', 'googlemail.com'];

class SetupError extends Error {}

function runClasp(args, { cwd = ROOT, interactive = false } = {}) {
  const words = args.map((word) => (/\s/.test(word) ? `"${word}"` : word));
  const result = spawnSync([CLASP, ...words].join(' '), {
    cwd,
    shell: true,
    encoding: 'utf8',
    stdio: interactive ? 'inherit' : ['inherit', 'pipe', 'pipe']
  });
  return { ok: result.status === 0, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function explainFailure(step, result) {
  const output = `${result.stderr}\n${result.stdout}`.trim();
  if (/apps script api|usersettings/i.test(output)) {
    return `${step} failed because the Apps Script API is turned off.\n`
      + `Turn it on at ${API_SETTINGS_URL}, wait a minute, then run this command again.`;
  }
  if (/admin_policy|access_denied|org_internal|blocked|disabled by/i.test(output)) {
    return `${step} failed, and your school may be blocking clasp. Ask your Google administrator,\n`
      + `or use the copy and paste steps in docs/setup.md.\n\nGoogle said: ${output}`;
  }
  return `${step} failed.\n\nGoogle said: ${output || '(no message)'}\n\n`
    + 'Run this command again to retry, or use the copy and paste steps in docs/setup.md.';
}

function checked(step, result) {
  if (!result.ok) throw new SetupError(explainFailure(step, result));
  return result;
}

// clasp can report some failures with a success exit code and no reply, so a step only
// counts as finished once it has returned the JSON reply it was asked for.
function jsonReply(step, result) {
  checked(step, result);
  const text = result.stdout;
  const start = text.search(/[[{]/);
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    throw new SetupError(explainFailure(step, result));
  }
}

function readJsonFile(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

function currentUser(clasp) {
  const result = clasp(['show-authorized-user', '--json']);
  return result.ok ? jsonReply('Checking your sign-in', result) : { loggedIn: false };
}

function logIn(clasp) {
  checked('Signing in', clasp(['login'], { interactive: true }));
  return currentUser(clasp);
}

async function signIn(clasp, ask, log) {
  let user = currentUser(clasp);
  if (!user.loggedIn) {
    log('A browser window will open. Sign in with your school Google account.');
    user = logIn(clasp);
  } else if (!(await ask(`clasp is signed in as ${user.email || 'an unknown account'}. Use this account?`))) {
    clasp(['logout']);
    log('A browser window will open. Sign in with your school Google account.');
    user = logIn(clasp);
  }
  if (!user.loggedIn) throw new SetupError('Sign-in didn\'t finish. Run this command again to retry.');
  const domain = (user.email || '').split('@')[1];
  if (PERSONAL_DOMAINS.includes(domain)) {
    throw new SetupError(`${user.email} is a personal account. The app needs a school Google Workspace account.`);
  }
  return user.email;
}

// clasp create overwrites appsscript.json with a blank one, which would remove the app's
// deployment settings. It runs in a temporary folder so that it can't touch src.
//
// clasp also searches parent folders for a .clasp.json, so an old one in the teacher's home
// folder could be picked up by mistake. Every project command names its folder with --project.
function createProject(clasp, root, title) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'foundations-'));
  try {
    const args = ['create-script', '--json', '--type', 'standalone', '--title', title, '--project', temp];
    const { scriptId } = jsonReply('Creating the Apps Script project', clasp(args, { cwd: temp }));
    if (!scriptId) throw new SetupError('Google didn\'t return an ID for the new project.');
    const settings = JSON.stringify({ scriptId, rootDir: 'src' }, null, 2);
    fs.writeFileSync(path.join(root, '.clasp.json'), `${settings}\n`);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

// The name goes into a shell command, so only plain characters are allowed.
function projectTitle(answer) {
  const title = (answer || '').trim() || DEFAULT_TITLE;
  if (!/^[\p{L}\p{N} _-]{1,80}$/u.test(title)) {
    throw new SetupError('Please use only letters, numbers, spaces and hyphens in the project name.');
  }
  return title;
}

function pushFiles(clasp, root) {
  jsonReply('Uploading the files', clasp(['push', '--force', '--json', '--project', root], { cwd: root }));
}

function webAppUrl(deploymentId, email) {
  const domain = (email || '').split('@')[1];
  const base = domain ? `https://script.google.com/a/macros/${domain}` : 'https://script.google.com/macros';
  return `${base}/s/${deploymentId}/exec`;
}

async function setup({ clasp = runClasp, ask, askText = async () => '', log = console.log, root = ROOT } = {}) {
  const claspFile = path.join(root, '.clasp.json');
  const deploymentFile = path.join(root, '.deployment.json');
  if (fs.existsSync(deploymentFile)) {
    throw new SetupError('This copy is already set up. To send changes to Google, use: npm run update');
  }

  log(`Before you start, turn on the Apps Script API at ${API_SETTINGS_URL}\n`);
  const email = await signIn(clasp, ask, log);

  if (fs.existsSync(claspFile)) {
    log('Using the Apps Script project already created for this copy.');
  } else {
    const title = projectTitle(await askText(`What should the project be called? Press Enter for "${DEFAULT_TITLE}":`));
    log('Creating the Apps Script project...');
    createProject(clasp, root, title);
  }

  log('Uploading the files...');
  pushFiles(clasp, root);

  log('Deploying the app...');
  const args = ['create-deployment', '--json', '--description', 'Computing Foundations', '--project', root];
  const { deploymentId } = jsonReply('Deploying the app', clasp(args, { cwd: root }));
  if (!deploymentId) throw new SetupError('Google didn\'t return an ID for the deployment.');

  const url = webAppUrl(deploymentId, email);
  fs.writeFileSync(deploymentFile, `${JSON.stringify({ deploymentId, url }, null, 2)}\n`);

  const { scriptId } = readJsonFile(claspFile);
  log(`
Done. Your app isn't ready for students until you finish these steps in docs/setup.md:

1. Open your project: https://script.google.com/d/${scriptId}/edit
2. Create your Sheet (step 3 of the guide).
3. Check the deployment settings and copy the Web app URL (step 4). It should be:
   ${url}
4. Add your classes and link to the app from your Google Site (steps 5 and 6).

Keep this URL out of the public repository.`);
}

async function update({ clasp = runClasp, log = console.log, root = ROOT } = {}) {
  const saved = readJsonFile(path.join(root, '.deployment.json'));
  if (!saved || !fs.existsSync(path.join(root, '.clasp.json'))) {
    throw new SetupError('This copy hasn\'t been set up yet. Run this first: npm run setup');
  }
  if (!/^[\w-]+$/.test(saved.deploymentId || '')) {
    throw new SetupError('The deployment ID in .deployment.json doesn\'t look right. Check the file against Manage deployments.');
  }

  log('Uploading the files...');
  pushFiles(clasp, root);

  log('Updating the deployment...');
  const stamp = new Date().toISOString().slice(0, 10);
  const args = ['update-deployment', saved.deploymentId, '--json', '--description', `Update ${stamp}`, '--project', root];
  jsonReply('Updating the deployment', clasp(args, { cwd: root }));
  log(`Done. Students have the new version at the same URL:\n${saved.url}`);
}

function askTextInTerminal(question) {
  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    terminal.question(`${question} `, (answer) => {
      terminal.close();
      resolve(answer);
    });
  });
}

async function askInTerminal(question) {
  return /^y/i.test((await askTextInTerminal(`${question} (y/n)`)).trim());
}

async function main() {
  const command = process.argv[2];
  if (parseInt(process.versions.node, 10) < MIN_NODE) {
    throw new SetupError(`This needs Node.js ${MIN_NODE} or later. You have ${process.versions.node}.`);
  }
  if (command === 'setup') return setup({ ask: askInTerminal, askText: askTextInTerminal });
  if (command === 'update') return update();
  throw new SetupError('Use: npm run setup, or npm run update');
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err instanceof SetupError ? `\n${err.message}` : err);
    process.exitCode = 1;
  });
}

module.exports = { setup, update, webAppUrl, SetupError };
