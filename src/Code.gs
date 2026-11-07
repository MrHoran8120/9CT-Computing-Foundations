/**
 * Server side of Computing Foundations.
 *
 * Deploy with "Execute as: Me" and "Who has access: anyone in your organisation".
 * The script runs as the teacher, so students never need access to the Sheet.
 * Every student-facing function below works out who the student is from the Google
 * session. None of them accept an identity from the browser.
 *
 * Students join by entering their name and a class code on their first visit. The code
 * only decides whether they can join and which class they're in. It never identifies them.
 *
 * The spreadsheet ID lives in Script Properties as SPREADSHEET_ID, not in this
 * public source code, so each teacher's copy uses its own private Sheet.
 */

var SHEETS = {
  CLASSES: { name: 'Classes', headers: ['Class', 'Code'] },
  STUDENTS: { name: 'Students', headers: ['Email', 'Name', 'Class', 'OS', 'Last active', 'Blocked'] },
  PROGRESS: { name: 'Progress', headers: ['Email', 'Name', 'Class', 'OS', 'Task ID', 'Done', 'Updated'] }
};
var VALID_OS = ['win', 'mac'];
var LOCK_WAIT_MS = 20000;
// Letters from any language, with spaces, hyphens, apostrophes and full stops. Starting with a
// letter also stops a name being treated as a Sheet formula.
var VALID_NAME = /^[\p{L}\p{M}][\p{L}\p{M} '’.\-]*$/u;
var MAX_NAME_LENGTH = 60;

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Computing Foundations')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Lets Index.html pull in the other HTML files. */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Run by the teacher from the Apps Script editor. Creates the progress Sheet the first
 * time, then adds any missing tabs. It's safe to run again. See docs/setup.md.
 */
function setupSheets() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  var book = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create('Computing Foundations progress');
  if (!id) props.setProperty('SPREADSHEET_ID', book.getId());

  Object.keys(SHEETS).forEach(function (key) {
    var def = SHEETS[key];
    var sheet = book.getSheetByName(def.name) || book.insertSheet(def.name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      sheet.setFrozenRows(1);
    } else {
      // Adds any column that a newer version of the app needs. Student rows aren't touched.
      sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
    }
  });

  buildDashboard_(book);

  var blank = book.getSheetByName('Sheet1');
  if (blank && !id) book.deleteSheet(blank);
  Logger.log('Your progress Sheet: ' + book.getUrl());
}

/** First call the app makes. Returns the signed-in student's course and saved progress. */
function getBootstrap() {
  var who = identify_();
  if (who.status !== 'ok') return { status: who.status };

  var book = openBook_();
  syncDashboard_(book);
  var progress = {};
  var ids = allTaskIds_();
  readRows_(book, SHEETS.PROGRESS).forEach(function (row) {
    var taskId = String(row[4]);
    if (normaliseEmail_(row[0]) === who.email && row[5] === true && ids.indexOf(taskId) !== -1) {
      progress[taskId] = true;
    }
  });

  return {
    status: 'ok',
    student: { name: who.name, className: who.className, os: who.os },
    course: courseWithContent_(),
    progress: progress
  };
}

/**
 * Joins the signed-in student to the class matching the code. Someone who has already joined
 * keeps their record, so a student can't move class or rename themselves by joining again.
 */
function registerStudent(name, code) {
  var email = normaliseEmail_(Session.getActiveUser().getEmail());
  if (!email) return { status: 'no_identity' };
  var cleanName = cleanName_(name);
  if (!cleanName) return { status: 'invalid_name' };
  return withLock_(function () {
    var book = openBook_();
    if (findStudentRow_(book, email)) return { status: 'registered' };
    var className = classForCode_(book, code);
    if (!className) return { status: 'wrong_code' };
    book.getSheetByName(SHEETS.STUDENTS.name).appendRow([email, cleanName, className, '', new Date(), '']);
    return { status: 'registered' };
  });
}

/** Returns a lesson file for the signed-in student to download. */
function getExerciseFile(name) {
  requireStudent_();
  if (!Object.prototype.hasOwnProperty.call(EXERCISE_FILES, name)) throw new Error('Unknown file.');
  var file = EXERCISE_FILES[name];
  return { name: name, mime: file.mime, data: file.data };
}

/** Saves the signed-in student's Windows or Mac choice. */
function setOs(os) {
  if (VALID_OS.indexOf(os) === -1) throw new Error('Unknown operating system.');
  var who = requireStudent_();
  return withLock_(function () {
    var book = openBook_();
    var now = new Date();
    var saved = findStudentRow_(book, who.email);
    var sheet = book.getSheetByName(SHEETS.STUDENTS.name);
    var row = [who.email, who.name, who.className, os, now];
    if (saved) {
      sheet.getRange(saved.rowNumber, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
    return { os: os, updated: now.toISOString() };
  });
}

/** Saves one tick or untick for the signed-in student. */
function setTask(taskId, done) {
  if (allTaskIds_().indexOf(taskId) === -1) throw new Error('Unknown task.');
  if (done !== true && done !== false) throw new Error('A task must be ticked or unticked.');
  var who = requireStudent_();
  return withLock_(function () {
    var book = openBook_();
    var now = new Date();
    var saved = findStudentRow_(book, who.email);
    var os = saved ? saved.os : '';
    var sheet = book.getSheetByName(SHEETS.PROGRESS.name);
    var row = [who.email, who.name, who.className, os, taskId, done, now];

    var rows = readRows_(book, SHEETS.PROGRESS);
    var existing = -1;
    for (var i = 0; i < rows.length; i++) {
      if (normaliseEmail_(rows[i][0]) === who.email && String(rows[i][4]) === taskId) {
        existing = i;
        break;
      }
    }
    if (existing === -1) {
      sheet.appendRow(row);
    } else {
      sheet.getRange(existing + 2, 1, 1, row.length).setValues([row]);
    }
    touchStudent_(book, who, os, now, saved);
    return { taskId: taskId, done: done, updated: now.toISOString() };
  });
}

/* Helpers. A trailing underscore keeps a function private: browsers can't call it. */

/** Works out who is signed in and finds their record. Never uses browser input. */
function identify_() {
  var email = normaliseEmail_(Session.getActiveUser().getEmail());
  if (!email) return { status: 'no_identity' };
  var saved = findStudentRow_(openBook_(), email);
  if (!saved) return { status: 'needs_registration' };
  if (saved.blocked) return { status: 'blocked' };
  return { status: 'ok', email: email, name: saved.name, className: saved.className, os: saved.os };
}

function requireStudent_() {
  var who = identify_();
  if (who.status !== 'ok') throw new Error('You are not signed in to this course.');
  return who;
}

function normaliseEmail_(value) {
  return String(value === null || value === undefined ? '' : value).trim().toLowerCase();
}

function cleanName_(value) {
  if (typeof value !== 'string') return '';
  var name = value.trim().replace(/\s+/g, ' ');
  return name.length <= MAX_NAME_LENGTH && VALID_NAME.test(name) ? name : '';
}

function normaliseCode_(value) {
  return String(value === null || value === undefined ? '' : value).replace(/\s+/g, '').toLowerCase();
}

/** Returns the class matching a code, or an empty string. A blank code never matches. */
function classForCode_(book, code) {
  var wanted = normaliseCode_(code);
  if (!wanted) return '';
  var rows = readRows_(book, SHEETS.CLASSES);
  for (var i = 0; i < rows.length; i++) {
    if (normaliseCode_(rows[i][1]) === wanted) return String(rows[i][0]).trim();
  }
  return '';
}

/** A teacher blocks a student by typing anything in the Blocked column, or ticking a checkbox. */
function isBlocked_(value) {
  var text = String(value === null || value === undefined ? '' : value).trim().toLowerCase();
  return text !== '' && text !== 'false' && text !== 'no';
}

function openBook_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('The course has no spreadsheet yet. Run setupSheets.');
  return SpreadsheetApp.openById(id);
}

/** Returns a tab's rows without the header row. */
function readRows_(book, def) {
  var sheet = book.getSheetByName(def.name);
  if (!sheet) throw new Error('The ' + def.name + ' tab is missing. Run setupSheets.');
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, def.headers.length).getValues();
}

function findStudentRow_(book, email) {
  var rows = readRows_(book, SHEETS.STUDENTS);
  for (var i = 0; i < rows.length; i++) {
    if (normaliseEmail_(rows[i][0]) === email) {
      var os = String(rows[i][3]);
      return {
        rowNumber: i + 2,
        name: String(rows[i][1]),
        className: String(rows[i][2]),
        os: VALID_OS.indexOf(os) === -1 ? null : os,
        blocked: isBlocked_(rows[i][5])
      };
    }
  }
  return null;
}

function touchStudent_(book, who, os, now, saved) {
  var sheet = book.getSheetByName(SHEETS.STUDENTS.name);
  var row = [who.email, who.name, who.className, os, now];
  if (saved) {
    sheet.getRange(saved.rowNumber, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

/** Runs one save at a time, so that students saving together can't create duplicate rows. */
function withLock_(work) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) throw new Error('The course is busy. Please try again.');
  try {
    var result = work();
    SpreadsheetApp.flush();
    return result;
  } finally {
    lock.releaseLock();
  }
}
