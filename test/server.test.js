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
  const lessonFiles = fs.readdirSync(src).filter((file) => /^Lesson\d+\.gs$/.test(file));
  ['Dashboard.gs', 'Diagrams.gs', 'ExerciseFiles.gs', ...lessonFiles].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(src, file), 'utf8'), ctx);
  });
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
  assert.strictEqual(ids.length, 83);
  assert.strictEqual(new Set(ids).size, ids.length);
  ids.forEach((id) => assert.match(id, /^L\d+-[A-Z]+-\d{2}$/));
});

test('each lesson has the expected core tasks and extra challenges', () => {
  const { ctx } = load();
  const counts = Array.from(ctx.COURSE).map((lesson) => {
    const sections = Array.from(lesson.sections);
    const core = sections.filter((s) => !s.extension);
    return [core.reduce((n, s) => n + s.tasks.length, 0), sections.length - core.length];
  });
  assert.deepStrictEqual(counts, [[15, 6], [16, 2], [16, 2], [15, 1], [9, 1]]);
});

test('extra challenges come after the core sections and are saved as extras', () => {
  const { ctx } = load();
  Array.from(ctx.COURSE).forEach((lesson) => {
    const flags = Array.from(lesson.sections).map((section) => Boolean(section.extension));
    assert.strictEqual(flags.indexOf(true), flags.filter((flag) => !flag).length, lesson.id);
    Array.from(lesson.sections).filter((section) => section.extension).forEach((section) => {
      Array.from(section.tasks).forEach((task) => assert.match(task.id, new RegExp('^' + lesson.id + '-EXTRA-')));
    });
  });
});

test('the answers to the "find files fast" challenge match Sam\'s real files', () => {
  const { ctx } = load();
  const zip = Buffer.from(ctx.EXERCISE_FILES['sams-files.zip'].data, 'base64');
  const files = [];
  let at = zip.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  while (at > -1 && zip.readUInt32LE(at) === 0x02014b50) {
    const nameLength = zip.readUInt16LE(at + 28);
    files.push({
      name: zip.toString('utf8', at + 46, at + 46 + nameLength).replace('Sams files/', ''),
      date: zip.readUInt16LE(at + 14),
      size: zip.readUInt32LE(at + 24)
    });
    at += 46 + nameLength;
  }
  assert.strictEqual(files.length, 15);
  const largest = [...files].sort((a, b) => b.size - a.size);
  const newest = [...files].sort((a, b) => b.date - a.date);
  assert.strictEqual(largest[0].name, 'logo-new.png');
  assert.ok(largest[0].size > largest[1].size);
  assert.strictEqual(newest[0].name, 'assignment final FINAL v2.docx');
  assert.ok(newest[0].date > newest[1].date);
  assert.strictEqual(new Set(files.map((file) => file.date)).size, 15, 'every date differs');
  assert.strictEqual(files.filter((file) => file.name.endsWith('.pdf')).length, 4);

  const blocks = flat(ctx.lesson1Content_())['L1-EXTRA-04'];
  const picked = (id) => { const block = blocks.find((item) => item.id === id); return block.options[block.answer]; };
  assert.strictEqual(picked('find1'), '`logo-new.png`');
  assert.strictEqual(picked('find2'), '`assignment final FINAL v2.docx`');
  assert.strictEqual(picked('find3'), '4');
});

test('every lesson is core, and retired task IDs are never used again', () => {
  const { ctx } = load();
  const optional = Array.from(ctx.COURSE).filter((l) => l.optional).map((l) => l.id);
  assert.deepStrictEqual(optional, []);
  const ids = Array.from(ctx.allTaskIds_());
  Array.from(ctx.RETIRED_IDS).forEach((id) => assert.ok(!ids.includes(id), id + ' is retired'));
});

test('extra challenges and Lesson 4 tasks save like any other', () => {
  const { ctx } = load();
  ctx.setTask('L1-EXTRA-01', true);
  ctx.setTask('L4-AI-02', true);
  const progress = ctx.getBootstrap().progress;
  assert.strictEqual(progress['L1-EXTRA-01'], true);
  assert.strictEqual(progress['L4-AI-02'], true);
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
  assert.match(data.L2, /D2:D=TRUE/);
  assert.match(data.E2, /"L1-EXTRA-\*"/);
  assert.match(data.J2, /E2:E\*\$U\$2\+F2:F\*\$V\$2\+G2:G\*\$W\$2\+H2:H\*\$X\$2/);
  assert.match(data.J2, /I2:I\*\$Y\$2/, 'every core lesson counts');
});

test('the Dashboard can show every class, labelled and sorted by class', () => {
  const { ctx, sheets } = load();
  ctx.setupSheets();
  const data = sheets['Dashboard data'].cells;
  assert.match(data.L2, /Dashboard!\$C\$4="All classes",C2:C<>""/);
  assert.match(data.L2, /Dashboard!\$F\$4="Class",8/);
  assert.match(data.AA2, /^=\{"All classes";/);
  assert.match(sheets.Dashboard.cells.C10, /\$C\$4="All classes".*!S2/);
  assert.match(sheets.Dashboard.cells.C9, /"Class"/);
  assert.ok(sheets.Dashboard.cells.B209, 'has 200 student rows');
  assert.strictEqual(sheets.Dashboard.cells.B210.includes('first 200'), true);
});

test('course changes correct the Dashboard totals when the next student loads the app', () => {
  const { ctx, sheets } = load();
  ctx.setupSheets();
  const totals = () => Array.from(sheets['Dashboard data'].rows[1].slice(20, 25));
  assert.deepStrictEqual(totals(), [15, 16, 16, 15, 9]);
  ctx.COURSE[0].sections[0].tasks.push({ id: 'L1-APPS-99', label: 'New task' });
  ctx.getBootstrap();
  assert.deepStrictEqual(totals(), [16, 16, 16, 15, 9]);
});

test('a Dashboard problem never stops a student loading the app', () => {
  const { ctx, sheets } = load();
  ctx.setupSheets();
  ctx.COURSE[0].sections[0].tasks.push({ id: 'L1-APPS-99', label: 'New task' });
  sheets['Dashboard data'].getRange = () => { throw new Error('tab broken'); };
  assert.strictEqual(ctx.getBootstrap().status, 'ok');
});

const flat = (value) => JSON.parse(JSON.stringify(value));
const lessonOne = (ctx) => flat(ctx.courseWithContent_())[0];

const written = (ctx) => flat(ctx.courseWithContent_()).filter((lesson) => ['L1', 'L5', 'L4'].includes(lesson.id));

test('every section of a written lesson has content, and every first task ID matches one', () => {
  const { ctx } = load();
  [['L1', ctx.lesson1Content_()], ['L5', ctx.lesson5Content_()], ['L4', ctx.lesson4Content_()]].forEach(([id, content]) => {
    const lesson = written(ctx).find((item) => item.id === id);
    lesson.sections.forEach((section) => assert.ok(section.content, section.title));
    const known = lesson.sections.map((section) => section.tasks[0].id);
    Object.keys(flat(content)).forEach((key) => assert.ok(known.includes(key), key));
  });
});

test('lessons are shown in course order, not ID order, and all in one unit', () => {
  const { ctx } = load();
  const lessons = flat(ctx.courseWithContent_());
  assert.deepStrictEqual(lessons.map((lesson) => lesson.id), ['L1', 'L5', 'L4', 'L2', 'L3']);
  lessons.forEach((lesson) => assert.strictEqual(lesson.unit, 'Foundations'));
  assert.deepStrictEqual(Array.from(ctx.lessonTotals_()).map((lesson) => lesson.title),
    ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4', 'Lesson 5']);
});

test('Dashboard columns past Z get the right letters', () => {
  const { ctx } = load();
  assert.deepStrictEqual([1, 26, 27, 52, 53].map(ctx.columnLetter_), ['A', 'Z', 'AA', 'AZ', 'BA']);
});

test('students turn on file extensions before they first download or rename a file', () => {
  const { ctx } = load();
  const lesson = lessonOne(ctx);
  const firstDownload = lesson.sections.findIndex((section) => section.content.some((block) => block.type === 'download'));
  const turnedOn = lesson.sections.findIndex((section) => section.tasks.some((task) => task.id === 'L1-EXT-01'));
  assert.strictEqual(turnedOn, firstDownload);
  const blocks = lesson.sections[turnedOn].content;
  const steps = blocks.findIndex((block) => JSON.stringify(block).includes('File name extensions'));
  assert.ok(steps > -1 && steps < blocks.findIndex((block) => block.type === 'download'));
});

test('lesson content is valid for both Windows and Mac', () => {
  const { ctx } = load();
  const blockTypes = ['objective', 'concept', 'tip', 'diagram', 'steps', 'keys', 'download', 'choice', 'match', 'tree'];
  const bothOrShared = (value, where) => {
    if (value && typeof value === 'object') {
      assert.ok(value.win && value.mac, where + ' needs both Windows and Mac');
    } else {
      assert.ok(value, where + ' is empty');
    }
  };
  const ids = new Set();
  written(ctx).forEach((lesson) => lesson.sections.forEach((section) => section.content.forEach((block) => {
    const where = section.title + ': ' + block.type;
    assert.ok(blockTypes.includes(block.type), where);
    if (block.only) assert.ok(['win', 'mac'].includes(block.only), where);
    if (block.type === 'diagram') { bothOrShared(block.svg, where); bothOrShared(block.alt, where); }
    if (block.type === 'steps') { assert.ok(block.title, where); block.steps.forEach((step) => bothOrShared(step, where)); }
    if (block.type === 'keys') block.rows.forEach((row) => bothOrShared(row[1], where));
    if (block.type === 'download') assert.ok(ctx.EXERCISE_FILES[block.file], block.file);
    if (block.type === 'choice') {
      block.options.forEach((option) => bothOrShared(option, where));
      assert.ok(block.answer >= 0 && block.answer < block.options.length, where);
    }
    if (block.type === 'match') block.items.forEach((item) => assert.ok(block.choices.includes(item.answer), item.text));
    if (block.id) { assert.ok(!ids.has(block.id), 'repeated id ' + block.id); ids.add(block.id); }
  })));
});

test('drawings are complete and hold no scripts', () => {
  const { ctx } = load();
  [ctx.appFileDiagram_(), ctx.olderWindowsExtensionsDiagram_(), ctx.windowDiagram_('win'), ctx.windowDiagram_('mac'), ctx.pathDiagram_('win'), ctx.pathDiagram_('mac'),
    ctx.copyMoveDiagram_(), ctx.extensionDiagram_(), ctx.storageDiagram_(), ctx.selectDiagram_('win'), ctx.selectDiagram_('mac'),
    ctx.saveDialogDiagram_('win'), ctx.saveDialogDiagram_('mac'), ctx.versionsDiagram_(), ctx.vscodeDiagram_()].forEach((svg) => {
    assert.match(svg, /^<svg .*<\/svg>$/s);
    assert.ok(!/<script|on[a-z]+=|href=/i.test(svg));
    assert.ok(!/undefined|NaN/.test(svg));
  });
});

test('a student can download lesson files, and nobody else can get them', () => {
  const { ctx } = load();
  const file = ctx.getExerciseFile('test-file.txt');
  assert.strictEqual(file.name, 'test-file.txt');
  assert.match(Buffer.from(file.data, 'base64').toString(), /found the test file/);
  ['../Code.gs', 'constructor', '__proto__', 'nope.txt'].forEach((name) => assert.throws(() => ctx.getExerciseFile(name), /Unknown file/));
  ctx.currentEmail = 'stranger@school.test';
  assert.throws(() => ctx.getExerciseFile('test-file.txt'));
});

test('Sam\'s ZIP holds 15 files in one folder', () => {
  const { ctx } = load();
  const zip = Buffer.from(ctx.EXERCISE_FILES['sams-files.zip'].data, 'base64');
  const names = [];
  for (let at = zip.indexOf('PK\x01\x02'); at !== -1; at = zip.indexOf('PK\x01\x02', at + 4)) {
    names.push(zip.toString('utf8', at + 46, at + 46 + zip.readUInt16LE(at + 28)));
  }
  assert.strictEqual(names.length, 15);
  names.forEach((name) => assert.match(name, /^Sams files\/[^/]+\.[a-z]+$/));
});

test('deployment settings run as the teacher, for the organisation only', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(src, 'appsscript.json'), 'utf8'));
  assert.strictEqual(manifest.webapp.executeAs, 'USER_DEPLOYING');
  assert.strictEqual(manifest.webapp.access, 'DOMAIN');
});

// Reads every file in a ZIP made by dev/build-exercise-files.js, which stores no data descriptors.
function unzip(buffer) {
  const zlib = require('zlib');
  const files = {};
  let at = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  while (at > -1 && buffer.readUInt32LE(at) === 0x02014b50) {
    const nameLength = buffer.readUInt16LE(at + 28);
    const name = buffer.toString('utf8', at + 46, at + 46 + nameLength);
    const local = buffer.readUInt32LE(at + 42);
    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const packed = buffer.subarray(start, start + buffer.readUInt32LE(at + 20));
    files[name] = { date: buffer.readUInt16LE(at + 14), data: zlib.inflateRawSync(packed) };
    at += 46 + nameLength + buffer.readUInt16LE(at + 30) + buffer.readUInt16LE(at + 32);
  }
  return files;
}

const fileFrom = (ctx, zipName) => unzip(Buffer.from(ctx.EXERCISE_FILES[zipName].data, 'base64'));
const picked = (blocks, id) => { const block = blocks.find((item) => item.id === id); return block.options[block.answer]; };

test('the speech answer is the only complete version, and the newest one is not it', () => {
  const { ctx } = load();
  const files = fileFrom(ctx, 'practice-files.zip');
  const speeches = Object.keys(files).filter((name) => /speech/.test(name));
  const complete = speeches.filter((name) => {
    const text = files[name].data.toString();
    return /Third,/.test(text) && /Thank you/.test(text);
  });
  assert.deepStrictEqual(complete, ['Practice files/speech-final.txt']);
  const newest = speeches.sort((a, b) => files[b].date - files[a].date)[0];
  assert.notStrictEqual(newest, complete[0]);
  const blocks = flat(ctx.lesson5Content_())['L5-VERSION-01'];
  assert.strictEqual(picked(blocks, 'speech'), '`speech-final.txt`');
});

test('the practice files suit the selection and search steps', () => {
  const { ctx } = load();
  const names = Object.keys(fileFrom(ctx, 'practice-files.zip')).map((name) => name.replace('Practice files/', ''));
  const top = names.filter((name) => !name.includes('/')).sort();
  const photos = top.filter((name) => /^photo-/.test(name));
  assert.strictEqual(photos.length, 3);
  assert.strictEqual(top.indexOf(photos[2]) - top.indexOf(photos[0]), 2, 'the photos sit together when sorted by name');
  const notes = top.filter((name) => /^notes-/.test(name));
  assert.deepStrictEqual(notes, ['notes-art.txt', 'notes-history.txt', 'notes-maths.txt', 'notes-science.txt']);
  assert.deepStrictEqual(names.filter((name) => /excursion/.test(name)), ['old stuff/2026/misc/excursion-form.pdf']);
  const blocks = flat(ctx.lesson5Content_())['L5-FIND-01'];
  assert.strictEqual(picked(blocks, 'where'), 'Practice files › old stuff › 2026 › misc');
});

test('only one garden report has all five parts, and it is not the newest', () => {
  const { ctx } = load();
  const files = fileFrom(ctx, 'garden-project.zip');
  const reports = Object.keys(files).filter((name) => /report.*\.txt$/.test(name));
  assert.strictEqual(reports.length, 3);
  const complete = reports.filter((name) => {
    const text = files[name].data.toString();
    return ['Aim', 'Method', 'Week 4', 'Conclusion'].every((part) => text.includes(part));
  });
  assert.deepStrictEqual(complete, ['Garden project/Copy of garden report.txt']);
  const newest = reports.sort((a, b) => files[b].date - files[a].date)[0];
  assert.strictEqual(newest, 'Garden project/garden report FINAL.txt');
  assert.strictEqual(Object.keys(files).filter((name) => /\.png$/.test(name)).length, 2, 'two images to move together');
  const blocks = flat(ctx.lesson5Content_())['L5-RECOVER-01'];
  assert.strictEqual(picked(blocks, 'garden'), '`Copy of garden report.txt`');
});

test('the Python starter files have the mistakes the VS Code lesson describes', () => {
  const { ctx } = load();
  const files = fileFrom(ctx, 'python-starter.zip');
  const read = (name) => files['Python/' + name].data.toString();
  assert.match(read('broken.py'), /print\("Hello, " \+ name\r?\n/, 'an unclosed bracket');
  assert.match(read('broken.py'), /if age > 12\r?\n/, 'a missing colon');
  assert.match(read('broken.py'), /nmae/, 'a misspelt name');
  assert.match(read('guess-game/guess.py'), /while guess != secret\r?\n/);
  assert.match(read('guess-game/guess.py'), /pritn/);
  assert.strictEqual(files['Python/guess-game/Untitled-1.py'].data.length, 0, 'the file to delete is empty');
  const game = Object.keys(files).filter((name) => name.startsWith('Python/guess-game/')).map((name) => name.split('/').pop()).sort();
  assert.deepStrictEqual(game, ['Untitled-1.py', 'guess-old.py', 'guess.py', 'high-scores.txt', 'ideas.txt']);
  Object.keys(files).filter((name) => name.endsWith('.py')).forEach((name) => {
    assert.ok(!/open\(|import (?!random)/.test(files[name].data.toString()), name + ' reads no other file, so moving files is safe');
  });
});

test('the VS Code lesson turns off AI features with the documented setting', () => {
  const { ctx } = load();
  const text = JSON.stringify(flat(ctx.lesson4Content_())['L4-AI-01']);
  assert.match(text, /chat\.disableAIFeatures/);
});
