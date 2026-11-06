// Tests the Apps Script server code against a fake Sheet. These show the logic is right.
// They can't show that Google's real sign-in behaves as expected.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = path.join(__dirname, '..', 'src');

// Formatting calls do nothing and can be chained, like the real ones.
function chainable(target) {
  const proxy = new Proxy(target, {
    get: (object, key) => (key in object ? object[key] : () => proxy)
  });
  return proxy;
}

function fakeSheet(name, sheets) {
  const base = {
    name,
    rows: [],
    cells: {},
    getLastRow: () => base.rows.length,
    appendRow: (row) => { base.rows.push(row.slice()); },
    clear: () => { base.cells = {}; },
    getRange: (row, col, numRows, numCols) => {
      const key = typeof row === 'string' ? row : String.fromCharCode(64 + col) + row;
      const range = chainable({
        getValue: () => base.cells[key],
        setValue: (value) => { base.cells[key] = value; return range; },
        setFormula: (value) => { base.cells[key] = value; return range; },
        setFormulas: (values) => {
          values.forEach((v, i) => v.forEach((cell, c) => { base.cells[String.fromCharCode(64 + col + c) + (row + i)] = cell; }));
          return range;
        },
        getValues: () => base.rows.slice(row - 1, row - 1 + numRows)
          .map((r) => r.slice(col - 1, col - 1 + numCols)),
        setValues: (values) => {
          values.forEach((v, i) => {
            const target = base.rows[row - 1 + i] || (base.rows[row - 1 + i] = []);
            v.forEach((cell, c) => { target[col - 1 + c] = cell; });
          });
          return range;
        }
      });
      return range;
    }
  };
  const sheet = chainable(base);
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
    deleteSheet: (sheet) => { delete sheets[sheet.name]; },
    setActiveSheet: () => {},
    moveActiveSheet: () => {}
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
      newDataValidation: () => chainable({}),
      newConditionalFormatRule: () => chainable({}),
      create: () => { ctx.created += 1; fakeSheet('Sheet1', sheets); return book; }
    },
    LockService: { getScriptLock: () => ({ tryLock: () => lockFree, releaseLock: () => {} }) },
    HtmlService: {},
    Date
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(src, 'Course.gs'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(src, 'Code.gs'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(src, 'Dashboard.gs'), 'utf8'), ctx);
  if (spreadsheetId) {
    ctx.setupSheets();
    sheets.Classes.appendRow(['Class A', ' Maple-42 ']);
    sheets.Classes.appendRow(['Class B', 7316]);
    sheets.Students.appendRow(['A@School.test ', 'Student A', 'Class A', '', '', '']);
    sheets.Students.appendRow(['b@school.test', 'Student B', 'Class B', '', '', '']);
  }
  return { ctx, sheets };
}

test('someone who has not joined gets no course data and can\'t save', () => {
  const { ctx, sheets } = load({ email: 'new@school.test' });
  const out = ctx.getBootstrap();
  assert.strictEqual(out.status, 'needs_registration');
  assert.strictEqual(out.course, undefined);
  assert.strictEqual(out.progress, undefined);
  assert.throws(() => ctx.setTask('L1-APPS-01', true));
  assert.throws(() => ctx.setOs('win'));
  assert.strictEqual(sheets.Progress.rows.length, 1);
  assert.strictEqual(sheets.Students.rows.length, 3);
});

test('the right code joins the student to that class using their Google identity', () => {
  const { ctx, sheets } = load({ email: 'New@School.test' });
  assert.strictEqual(ctx.registerStudent('  Sam   Lee ', 'maple-42').status, 'registered');
  const row = sheets.Students.rows[3];
  assert.deepStrictEqual([row[0], row[1], row[2]], ['new@school.test', 'Sam Lee', 'Class A']);
  const out = ctx.getBootstrap();
  assert.strictEqual(out.status, 'ok');
  assert.strictEqual(out.student.className, 'Class A');
  assert.strictEqual(out.student.os, null);
});

test('class codes ignore capitals and spaces, and can be numbers', () => {
  const { ctx } = load({ email: 'new@school.test' });
  assert.strictEqual(ctx.registerStudent('Sam Lee', ' MAPLE - 42 ').status, 'registered');
  ctx.currentEmail = 'other@school.test';
  assert.strictEqual(ctx.registerStudent('Ana Diaz', '7316').status, 'registered');
  assert.strictEqual(ctx.getBootstrap().student.className, 'Class B');
});

test('a wrong or blank code joins nobody, even when a class has no code', () => {
  const { ctx, sheets } = load({ email: 'new@school.test' });
  sheets.Classes.appendRow(['Class C', '']);
  ['nope', '', '   ', null, undefined].forEach((code) => {
    assert.strictEqual(ctx.registerStudent('Sam Lee', code).status, 'wrong_code');
  });
  assert.strictEqual(sheets.Students.rows.length, 3);
});

test('names that could be Sheet formulas or aren\'t names are refused', () => {
  const { ctx, sheets } = load({ email: 'new@school.test' });
  ['', '   ', '=IMPORTRANGE("x")', '+1', '-1', '@x', '<b>x</b>', 'x'.repeat(61), null, 5, ['Sam']].forEach((name) => {
    assert.strictEqual(ctx.registerStudent(name, 'maple-42').status, 'invalid_name');
  });
  assert.strictEqual(sheets.Students.rows.length, 3);
});

test('real names in many forms are accepted', () => {
  ["O'Brien", 'Anne-Marie Tran', 'Nguyễn Thị Mai', '李小龙', 'Priya K.'].forEach((name, i) => {
    const { ctx } = load({ email: `n${i}@school.test` });
    assert.strictEqual(ctx.registerStudent(name, 'maple-42').status, 'registered', name);
  });
});

test('joining again can\'t change a student\'s name or class', () => {
  const { ctx, sheets } = load();
  assert.strictEqual(ctx.registerStudent('Someone Else', '7316').status, 'registered');
  assert.strictEqual(sheets.Students.rows.length, 3);
  const { name, className } = ctx.getBootstrap().student;
  assert.deepStrictEqual([name, className], ['Student A', 'Class A']);
});

test('joining can\'t register a different identity from the browser', () => {
  const { ctx, sheets } = load({ email: 'new@school.test' });
  ctx.registerStudent('Sam Lee', 'maple-42', 'victim@school.test');
  assert.strictEqual(sheets.Students.rows[3][0], 'new@school.test');
});

test('a blank Google identity can\'t join', () => {
  const { ctx, sheets } = load({ email: '' });
  assert.strictEqual(ctx.registerStudent('Sam Lee', 'maple-42').status, 'no_identity');
  assert.strictEqual(sheets.Students.rows.length, 3);
});

test('a blocked student gets no data, can\'t save and can\'t rejoin', () => {
  const { ctx, sheets } = load();
  sheets.Students.rows[1][5] = 'yes';
  const out = ctx.getBootstrap();
  assert.strictEqual(out.status, 'blocked');
  assert.strictEqual(out.course, undefined);
  assert.throws(() => ctx.setTask('L1-APPS-01', true));
  ctx.registerStudent('Student A', 'maple-42');
  assert.strictEqual(ctx.getBootstrap().status, 'blocked');
});

test('the Blocked column accepts a checkbox, and an unticked one doesn\'t block', () => {
  const { ctx, sheets } = load();
  sheets.Students.rows[1][5] = false;
  assert.strictEqual(ctx.getBootstrap().status, 'ok');
  sheets.Students.rows[1][5] = true;
  assert.strictEqual(ctx.getBootstrap().status, 'blocked');
});

test('saving a tick or computer choice keeps a block and the teacher\'s corrections', () => {
  const { ctx, sheets } = load();
  sheets.Students.rows[1][1] = 'Corrected Name';
  sheets.Students.rows[1][5] = 'no';
  ctx.setOs('mac');
  ctx.setTask('L1-APPS-01', true);
  assert.strictEqual(sheets.Students.rows[1][1], 'Corrected Name');
  assert.strictEqual(sheets.Students.rows[1][5], 'no');
  assert.strictEqual(ctx.getBootstrap().student.name, 'Corrected Name');
});

test('joining while the course is busy reports failure and writes nothing', () => {
  const { ctx, sheets } = load({ email: 'new@school.test', lockFree: false });
  assert.throws(() => ctx.registerStudent('Sam Lee', 'maple-42'), /busy/);
  assert.strictEqual(sheets.Students.rows.length, 3);
});

test('a blank Google identity is refused', () => {
  const { ctx } = load({ email: '' });
  assert.strictEqual(ctx.getBootstrap().status, 'no_identity');
  assert.throws(() => ctx.setTask('L1-APPS-01', true));
});

test('matching a student\'s record ignores capitals and stray spaces', () => {
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
  assert.strictEqual(sheets.Students.rows.length, 3);
});

test('the operating system choice persists and can be changed', () => {
  const { ctx, sheets } = load();
  ctx.setOs('mac');
  assert.strictEqual(ctx.getBootstrap().student.os, 'mac');
  ctx.setOs('win');
  assert.strictEqual(ctx.getBootstrap().student.os, 'win');
  assert.strictEqual(sheets.Students.rows.length, 3);
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
  assert.deepStrictEqual(Object.keys(ctx.sheets).sort(), ['Classes', 'Dashboard', 'Dashboard data', 'Progress', 'Students']);
});

test('running setup again creates nothing new and keeps existing data', () => {
  const { ctx, sheets } = load();
  ctx.setTask('L1-APPS-01', true);
  ctx.setupSheets();
  assert.strictEqual(ctx.created, 0);
  assert.strictEqual(sheets.Classes.rows.length, 3);
  assert.strictEqual(sheets.Students.rows.length, 3);
  assert.strictEqual(sheets.Progress.rows.length, 2);
});

test('running setup on an older Sheet adds the new tab and column and keeps its data', () => {
  const { ctx, sheets } = load();
  delete sheets.Classes;
  sheets.Students.rows = [['Email', 'Name', 'Class', 'OS', 'Last active'], ['a@school.test', 'Student A', 'Class A', 'mac', 'then']];
  const oldRoster = [['Email', 'Name', 'Class'], ['x@school.test', 'X', 'Class A']];
  sheets.Roster = { rows: oldRoster, getLastRow: () => 2 };
  sheets.Roster.getRange = () => { throw new Error('the old Roster tab must not be touched'); };
  ctx.setupSheets();
  assert.strictEqual(JSON.stringify(sheets.Classes.rows), '[["Class","Code"]]');
  assert.strictEqual(sheets.Students.rows[0][5], 'Blocked');
  assert.deepStrictEqual(sheets.Students.rows[1], ['a@school.test', 'Student A', 'Class A', 'mac', 'then']);
  assert.strictEqual(ctx.getBootstrap().status, 'ok');
});

test('progress saved under a retired task ID is ignored', () => {
  const { ctx, sheets } = load();
  sheets.Progress.appendRow(['a@school.test', 'Student A', 'Class A', 'win', 'L9-OLD-01', true, new Date()]);
  assert.strictEqual(ctx.getBootstrap().progress['L9-OLD-01'], undefined);
});

test('every task ID is unique and follows the naming pattern', () => {
  const { ctx } = load();
  const ids = Array.from(ctx.allTaskIds_());
  assert.strictEqual(ids.length, 55);
  assert.strictEqual(new Set(ids).size, ids.length);
  ids.forEach((id) => assert.match(id, /^L[1-4]-[A-Z]+-\d{2}$/));
});

test('each lesson has the expected core tasks and one extra challenge', () => {
  const { ctx } = load();
  const counts = Array.from(ctx.COURSE).map((lesson) => {
    const sections = Array.from(lesson.sections);
    const core = sections.filter((s) => !s.extension);
    return [core.reduce((n, s) => n + s.tasks.length, 0), sections.length - core.length];
  });
  assert.deepStrictEqual(counts, [[15, 1], [15, 1], [9, 1], [12, 1]]);
});

test('only Lesson 4 is optional', () => {
  const { ctx } = load();
  const optional = Array.from(ctx.COURSE).filter((l) => l.optional).map((l) => l.id);
  assert.deepStrictEqual(optional, ['L4']);
});

test('extra challenges and Lesson 4 tasks save like any other', () => {
  const { ctx } = load();
  ctx.setTask('L1-EXTRA-01', true);
  ctx.setTask('L4-TERM-01', true);
  const progress = ctx.getBootstrap().progress;
  assert.strictEqual(progress['L1-EXTRA-01'], true);
  assert.strictEqual(progress['L4-TERM-01'], true);
});

test('the app opens in its own tab and does not allow other sites to embed it', () => {
  const { ctx } = load();
  const page = {
    evaluate: () => page,
    setTitle: () => page,
    addMetaTag: () => page,
    setXFrameOptionsMode: () => { throw new Error('embedding should stay off'); }
  };
  ctx.HtmlService = { createTemplateFromFile: () => page, XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' } };
  assert.strictEqual(ctx.doGet(), page);
});

const allFormulas = (sheet) => Object.values(sheet.cells).join('\n');

test('setup builds a Dashboard that shows no emails and keeps the teacher\'s choices', () => {
  const { ctx, sheets } = load();
  ctx.setupSheets();
  assert.strictEqual(sheets.Dashboard.cells.C4, 'Class A');
  assert.strictEqual(sheets.Dashboard.cells.F4, 'Most progress');
  assert.ok(!/Students!|Progress!/.test(allFormulas(sheets.Dashboard)), 'reads only the sorted table');
  assert.ok(!/\{A2:A/.test(allFormulas(sheets['Dashboard data'])), 'emails stay out of the sorted table');
  sheets.Dashboard.cells.C4 = 'Class B';
  sheets.Dashboard.cells.F4 = 'Name';
  ctx.setupSheets();
  assert.strictEqual(sheets.Dashboard.cells.C4, 'Class B');
  assert.strictEqual(sheets.Dashboard.cells.F4, 'Name');
});

test('the Dashboard leaves out blocked students, extra challenges and optional lessons', () => {
  const { ctx, sheets } = load();
  ctx.setupSheets();
  const data = sheets['Dashboard data'].cells;
  assert.match(data.K2, /D2:D=TRUE/);
  assert.match(data.E2, /"L1-EXTRA-\*"/);
  assert.match(data.I2, /E2:E\*\$R\$2\+F2:F\*\$S\$2\+G2:G\*\$T\$2/);
  assert.ok(!/H2:H/.test(data.I2), 'Lesson 4 is optional');
});

test('course changes correct the Dashboard totals when the next student loads the app', () => {
  const { ctx, sheets } = load();
  ctx.setupSheets();
  const totals = () => Array.from(sheets['Dashboard data'].rows[1].slice(17, 21));
  assert.deepStrictEqual(totals(), [15, 15, 9, 12]);
  ctx.COURSE[0].sections[0].tasks.push({ id: 'L1-APPS-99', label: 'New task' });
  ctx.getBootstrap();
  assert.deepStrictEqual(totals(), [16, 15, 9, 12]);
});

test('a Dashboard problem never stops a student loading the app', () => {
  const { ctx, sheets } = load();
  ctx.setupSheets();
  ctx.COURSE[0].sections[0].tasks.push({ id: 'L1-APPS-99', label: 'New task' });
  sheets['Dashboard data'].getRange = () => { throw new Error('tab broken'); };
  assert.strictEqual(ctx.getBootstrap().status, 'ok');
});

test('deployment settings run as the teacher, for the organisation only', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(src, 'appsscript.json'), 'utf8'));
  assert.strictEqual(manifest.webapp.executeAs, 'USER_DEPLOYING');
  assert.strictEqual(manifest.webapp.access, 'DOMAIN');
});
