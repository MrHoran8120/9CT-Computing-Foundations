// Tests the Apps Script server code against a fake Sheet. These show the logic is right.
// They can't show that Google's real sign-in behaves as expected in a Google Site.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = path.join(__dirname, '..', 'src');

function fakeSheet(name, sheets) {
  const sheet = {
    name,
    rows: [],
    getLastRow: () => sheet.rows.length,
    appendRow: (row) => { sheet.rows.push(row.slice()); },
    setFrozenRows: () => {},
    getRange: (row, col, numRows, numCols) => ({
      getValues: () => sheet.rows.slice(row - 1, row - 1 + numRows)
        .map((r) => r.slice(col - 1, col - 1 + numCols)),
      setValues: (values) => {
        values.forEach((v, i) => { sheet.rows[row - 1 + i] = v.slice(); });
      }
    })
  };
  sheets[name] = sheet;
  return sheet;
}

function load({ email = 'a@school.test', spreadsheetId = 'ID', lockFree = true } = {}) {
  const sheets = {};
  const book = {
    getId: () => 'NEW-ID',
    getUrl: () => 'https://sheet.test',
    getSheetByName: (name) => sheets[name] || null,
    insertSheet: (name) => fakeSheet(name, sheets),
    deleteSheet: (sheet) => { delete sheets[sheet.name]; }
  };
  const props = { SPREADSHEET_ID: spreadsheetId };
  const ctx = {
    currentEmail: email,
    created: 0,
    props,
    sheets,
    Logger: { log: () => {} },
    Session: { getActiveUser: () => ({ getEmail: () => ctx.currentEmail }) },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (key) => props[key],
      setProperty: (key, value) => { props[key] = value; }
    }) },
    SpreadsheetApp: {
      openById: () => book,
      flush: () => {},
      create: () => { ctx.created += 1; fakeSheet('Sheet1', sheets); return book; }
    },
    LockService: { getScriptLock: () => ({ tryLock: () => lockFree, releaseLock: () => {} }) },
    HtmlService: {},
    Date
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(src, 'Course.gs'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(src, 'Code.gs'), 'utf8'), ctx);
  if (spreadsheetId) {
    ctx.setupSheets();
    sheets.Roster.appendRow(['A@School.test ', 'Student A', 'Class A']);
    sheets.Roster.appendRow(['b@school.test', 'Student B', 'Class B']);
  }
  return { ctx, sheets };
}

test('a student not on the roster gets no course data', () => {
  const { ctx } = load({ email: 'stranger@school.test' });
  const out = ctx.getBootstrap();
  assert.strictEqual(out.status, 'not_on_roster');
  assert.strictEqual(out.course, undefined);
  assert.strictEqual(out.progress, undefined);
});

test('a blank Google identity is refused', () => {
  const { ctx } = load({ email: '' });
  assert.strictEqual(ctx.getBootstrap().status, 'no_identity');
  assert.throws(() => ctx.setTask('L1-APPS-01', true));
});

test('roster matching ignores capitals and stray spaces', () => {
  const { ctx } = load();
  const out = ctx.getBootstrap();
  assert.strictEqual(out.status, 'ok');
  assert.strictEqual(out.student.name, 'Student A');
  assert.strictEqual(out.student.os, null);
});

test('a tick is saved and comes back after signing in again', () => {
  const { ctx, sheets } = load();
  ctx.setTask('L1-APPS-01', true);
  assert.strictEqual(ctx.getBootstrap().progress['L1-APPS-01'], true);
  const row = sheets.Progress.rows[1];
  assert.strictEqual(row[0], 'a@school.test');
  assert.strictEqual(row[1], 'Student A');
  assert.strictEqual(row[2], 'Class A');
  assert.strictEqual(row[4], 'L1-APPS-01');
});

test('unticking clears the task without adding a row', () => {
  const { ctx, sheets } = load();
  ctx.setTask('L1-APPS-01', true);
  ctx.setTask('L1-APPS-01', false);
  assert.strictEqual(ctx.getBootstrap().progress['L1-APPS-01'], undefined);
  assert.strictEqual(sheets.Progress.rows.length, 2);
});

test('repeated saves never duplicate a row', () => {
  const { ctx, sheets } = load();
  for (let i = 0; i < 5; i++) ctx.setTask('L2-ZIP-01', i % 2 === 0);
  assert.strictEqual(sheets.Progress.rows.length, 2);
});

test('one student can neither see nor change another student\'s progress', () => {
  const { ctx, sheets } = load();
  ctx.setTask('L1-APPS-01', true);
  ctx.currentEmail = 'b@school.test';
  assert.strictEqual(ctx.getBootstrap().progress['L1-APPS-01'], undefined);
  ctx.setTask('L1-APPS-01', true);
  ctx.setTask('L1-APPS-01', false);
  ctx.currentEmail = 'a@school.test';
  assert.strictEqual(ctx.getBootstrap().progress['L1-APPS-01'], true);
  assert.strictEqual(sheets.Progress.rows.length, 3);
});

test('extra browser arguments can\'t change whose record is saved', () => {
  const { ctx, sheets } = load();
  ctx.setTask('L1-APPS-01', true, 'b@school.test');
  assert.strictEqual(sheets.Progress.rows[1][0], 'a@school.test');
});

test('unknown tasks and invalid values are rejected and nothing is written', () => {
  const { ctx, sheets } = load();
  assert.throws(() => ctx.setTask('=IMPORTRANGE("x")', true));
  assert.throws(() => ctx.setTask('L1-APPS-01', 'yes'));
  assert.throws(() => ctx.setOs('linux'));
  assert.strictEqual(sheets.Progress.rows.length, 1);
  assert.strictEqual(sheets.Students.rows.length, 1);
});

test('the operating system choice persists and can be changed', () => {
  const { ctx, sheets } = load();
  ctx.setOs('mac');
  assert.strictEqual(ctx.getBootstrap().student.os, 'mac');
  ctx.setOs('win');
  assert.strictEqual(ctx.getBootstrap().student.os, 'win');
  assert.strictEqual(sheets.Students.rows.length, 2);
});

test('a tick records the chosen operating system', () => {
  const { ctx, sheets } = load();
  ctx.setOs('mac');
  ctx.setTask('L1-APPS-01', true);
  assert.strictEqual(sheets.Progress.rows[1][3], 'mac');
});

test('a tick does not lose the chosen operating system', () => {
  const { ctx } = load();
  ctx.setOs('mac');
  ctx.setTask('L1-APPS-01', true);
  assert.strictEqual(ctx.getBootstrap().student.os, 'mac');
});

test('a busy lock reports failure and writes nothing', () => {
  const { ctx, sheets } = load({ lockFree: false });
  assert.throws(() => ctx.setTask('L1-APPS-01', true), /busy/);
  assert.strictEqual(sheets.Progress.rows.length, 1);
});

test('a missing spreadsheet setting gives a clear error', () => {
  const { ctx } = load({ spreadsheetId: null });
  assert.throws(() => ctx.getBootstrap(), /spreadsheet/);
});

test('first-time setup creates a Sheet with the right tabs and remembers it', () => {
  const { ctx } = load({ spreadsheetId: null });
  ctx.setupSheets();
  assert.strictEqual(ctx.created, 1);
  assert.strictEqual(ctx.props.SPREADSHEET_ID, 'NEW-ID');
  assert.deepStrictEqual(Object.keys(ctx.sheets).sort(), ['Progress', 'Roster', 'Students']);
});

test('running setup again creates nothing new and keeps existing data', () => {
  const { ctx, sheets } = load();
  ctx.setTask('L1-APPS-01', true);
  ctx.setupSheets();
  assert.strictEqual(ctx.created, 0);
  assert.strictEqual(sheets.Roster.rows.length, 3);
  assert.strictEqual(sheets.Progress.rows.length, 2);
});

test('progress saved under a retired task ID is ignored', () => {
  const { ctx, sheets } = load();
  sheets.Progress.appendRow(['a@school.test', 'Student A', 'Class A', 'win', 'L9-OLD-01', true, new Date()]);
  assert.strictEqual(ctx.getBootstrap().progress['L9-OLD-01'], undefined);
});

test('every task ID is unique and follows the naming pattern', () => {
  const { ctx } = load();
  const ids = Array.from(ctx.allTaskIds_());
  assert.strictEqual(ids.length, 39);
  assert.strictEqual(new Set(ids).size, ids.length);
  ids.forEach((id) => assert.match(id, /^L[123]-[A-Z]+-\d{2}$/));
});

test('deployment settings run as the teacher, for the organisation only', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(src, 'appsscript.json'), 'utf8'));
  assert.strictEqual(manifest.webapp.executeAs, 'USER_DEPLOYING');
  assert.strictEqual(manifest.webapp.access, 'DOMAIN');
});
