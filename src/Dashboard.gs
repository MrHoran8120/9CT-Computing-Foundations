/**
 * Builds the Dashboard tab that a teacher can show on the board. It runs from setupSheets.
 *
 * The Show drop-down switches between the whole course and one lesson. The lesson view has one
 * column per section, a whole-class row showing how many have finished each section, and a
 * count of extra challenges.
 *
 * Everything on it is a live formula, so it updates as students tick tasks. It shows first
 * names and last initials only. Emails stay in the hidden data tab, because the whole class
 * can see the Dashboard. Extra challenges don't count towards progress, and an optional lesson
 * doesn't count towards the overall figure.
 *
 * Changing a lesson needs no work here. The course's lessons, sections and task IDs live in the
 * hidden data tab, and syncDashboard_ rewrites that tab the next time a student opens the app.
 * Only adding or removing a whole lesson, or a lesson growing past DASHBOARD.MIN_COLUMNS
 * sections, changes the Dashboard's layout, which needs setupSheets to run again.
 */

var DASHBOARD = {
  NAME: 'Dashboard',
  DATA: 'Dashboard data',
  HEADER_ROW: 9,
  CLASS_ROW: 10,
  FIRST_ROW: 11,
  ROWS: 200,
  CLASS_CELL: 'C4',
  SORT_CELL: 'F4',
  SHOW_CELL: 'I4',
  SORT_PROGRESS: 'Most progress',
  SORT_NAME: 'Name',
  SORT_CLASS: 'Class',
  ALL_CLASSES: 'All classes',
  ALL_LESSONS: 'All lessons',
  // Room for this many sections in the lesson view, so adding a section rarely needs setupSheets.
  MIN_COLUMNS: 10,
  INK: '#16213a',
  MUTED: '#55617a',
  PALE: '#f1f4fa',
  DONE: '#d7f0e0',
  CLASS_ROW_FILL: '#fff4cc',
  FINISHED: '#1e8e4e',
  STAR: '#b07800',
  // Each lesson's colour in the app. A lesson without one uses the ink colour.
  BARS: { L1: '#1f5fd6', L5: '#6b3fc4', L4: '#a8327a', L2: '#b4540a', L3: '#0a7d6c' }
};

/** The course as the Dashboard sees it, in the order students see the lessons. */
function dashboardModel_() {
  var lessons = COURSE.map(function (lesson, i) {
    var sections = lesson.sections.filter(function (section) { return !section.extension; }).map(function (section) {
      return { title: section.title, tasks: section.tasks.map(function (task) { return task.id; }) };
    });
    var total = sections.reduce(function (n, section) { return n + section.tasks.length; }, 0);
    // Matches the lesson's tab in the app, such as "2. Save and find".
    var title = (i + 1) + '. ' + lesson.tab + (lesson.optional && !/optional/i.test(lesson.tab) ? ' (optional)' : '');
    return { id: lesson.id, title: title, total: total, optional: !!lesson.optional, sections: sections, colour: DASHBOARD.BARS[lesson.id] || DASHBOARD.INK };
  });
  var most = lessons.reduce(function (n, lesson) { return Math.max(n, lesson.sections.length); }, 0);
  return { lessons: lessons, width: Math.max(DASHBOARD.MIN_COLUMNS, most, lessons.length) };
}

/** Kept for older callers and tests: each lesson with its title and counted tasks. */
function lessonTotals_() {
  return dashboardModel_().lessons.map(function (lesson) {
    return { id: lesson.id, title: lesson.title, total: lesson.total, optional: lesson.optional };
  });
}

/** 1 is A, 26 is Z, 27 is AA. */
function columnLetter_(number) {
  var letters = '';
  while (number > 0) {
    var rest = (number - 1) % 26;
    letters = String.fromCharCode(65 + rest) + letters;
    number = Math.floor((number - 1) / 26);
  }
  return letters;
}

/** Where everything sits in the hidden data tab, as column numbers. Row 1 holds labels. */
function dashboardLayout_(model) {
  var count = model.lessons.length;
  var width = model.width;
  var c = { lessonCount: count, width: width };
  c.lesson = function (i) { return 5 + i; };
  c.overall = 5 + count;
  c.courseTable = c.overall + 2;               // sorted: name, overall, each lesson, class
  c.totals = c.courseTable + count + 4;        // tasks counted in each lesson
  c.classList = c.totals + count + 1;          // the Class drop-down's choices
  c.show = c.classList + 2;                    // row 2: lesson number shown (0 = all); row 3: most are up to
  c.showList = c.show + 1;                     // the Show drop-down's choices
  c.colours = c.showList + 1;                  // each lesson's colour
  c.lessonDone = c.colours + 2;                // the shown lesson's progress, per student
  c.section = function (k) { return c.lessonDone + k; };
  c.extras = c.lessonDone + width + 1;
  c.finished = c.lessonDone + width + 2;       // sections finished in the shown lesson
  c.lessonTable = c.lessonDone + width + 4;    // sorted: name, lesson, each section, extras, class
  c.titles = c.lessonTable + width + 5;        // section titles, one row per lesson
  c.last = c.titles + width - 1;
  return c;
}

function col_(number) { return columnLetter_(number); }
function colRange_(number) { var l = col_(number); return l + '2:' + l; }
function dataRef_(number, row) { return "'" + DASHBOARD.DATA + "'!$" + col_(number) + '$' + row; }
function dataCol_(number) { var l = col_(number); return "'" + DASHBOARD.DATA + "'!" + l + '2:' + l; }
function dashCell_(a1) { return 'Dashboard!$' + a1.replace(/(\d+)/, '$$$1'); }

function countTicks_(criteria) {
  return 'COUNTIFS(Progress!$A$2:$A,A2:A,Progress!$F$2:$F,TRUE,Progress!$E$2:$E,' + criteria + ')';
}

/** The formulas for the hidden data tab, keyed by cell. */
function dashboardDataFormulas_(model) {
  var lessons = model.lessons;
  var c = dashboardLayout_(model);
  var show = 'MAX(1,$' + col_(c.show) + '$2)';
  var classCell = dashCell_(DASHBOARD.CLASS_CELL);
  var sortCell = dashCell_(DASHBOARD.SORT_CELL);
  var inClass = 'IF(' + classCell + '="' + DASHBOARD.ALL_CLASSES + '",C2:C<>"",C2:C=TO_TEXT(' + classCell + '))';
  var sorted = function (columns, classColumn) {
    var sortColumn = 'IF(' + sortCell + '="' + DASHBOARD.SORT_NAME + '",1,IF(' + sortCell + '="' + DASHBOARD.SORT_CLASS + '",' + classColumn + ',2))';
    return '=IFERROR(ARRAYFORMULA(SORT(FILTER({' + columns.join(',') + '},' + inClass + ',D2:D=TRUE),'
      + sortColumn + ',' + sortCell + '<>"' + DASHBOARD.SORT_PROGRESS + '",2,FALSE,1,TRUE)))';
  };
  var perStudent = function (expression) { return '=ARRAYFORMULA(IF(A2:A="","",' + expression + '))'; };

  var f = {
    A2: '=ARRAYFORMULA(IF(Students!A2:A="","",Students!A2:A))',
    B2: '=ARRAYFORMULA(IF(Students!A2:A="","",REGEXREPLACE(TO_TEXT(Students!B2:B),"^\\s*(\\S+).*\\s(\\S)\\S*\\s*$","$1 $2.")))',
    C2: '=ARRAYFORMULA(IF(Students!A2:A="","",TO_TEXT(Students!C2:C)))',
    D2: '=ARRAYFORMULA(REGEXMATCH(LOWER(TRIM(TO_TEXT(Students!F2:F))),"^(false|no)?$"))'
  };

  // The whole course: each lesson's share of tasks done, then the overall figure.
  var counted = [];
  lessons.forEach(function (lesson, i) {
    var total = dataRefLocal_(c.totals + i);
    var done = '(' + countTicks_('"' + lesson.id + '-*"') + '-' + countTicks_('"' + lesson.id + '-EXTRA-*"') + ')';
    f[col_(c.lesson(i)) + '2'] = '=ARRAYFORMULA(IF(Students!A2:A="","",IF(' + done + '>=' + total + ',1,' + done + '/' + total + ')))';
    if (!lesson.optional) counted.push({ column: col_(c.lesson(i)), total: total });
  });
  f[col_(c.overall) + '2'] = '=ARRAYFORMULA(IF(Students!A2:A="","",(' + counted.map(function (item) {
    return item.column + '2:' + item.column + '*' + item.total;
  }).join('+') + ')/(' + counted.map(function (item) { return item.total; }).join('+') + ')))';
  f[col_(c.courseTable) + '2'] = sorted(['B2:B', colRange_(c.overall)].concat(lessons.map(function (lesson, i) {
    return colRange_(c.lesson(i));
  })).concat(['C2:C']), 3 + lessons.length);
  f[col_(c.classList) + '2'] = '={"' + DASHBOARD.ALL_CLASSES + '";IFERROR(FILTER(TO_TEXT(Classes!A2:A),Classes!A2:A<>""))}';

  // The lesson chosen in Show. 0 means the whole course.
  var showList = '$' + col_(c.showList) + '$2:$' + col_(c.showList) + '$' + (lessons.length + 2);
  f[col_(c.show) + '2'] = '=IFERROR(MATCH(' + dashCell_(DASHBOARD.SHOW_CELL) + ',' + showList + ',0)-1,0)';

  // The shown lesson: its progress, each section, extra challenges and sections finished.
  f[col_(c.lessonDone) + '2'] = perStudent('CHOOSE(' + show + ',' + lessons.map(function (lesson, i) { return colRange_(c.lesson(i)); }).join(',') + ')');
  for (var k = 1; k <= c.width; k++) {
    var branches = lessons.map(function (lesson) {
      var section = lesson.sections[k - 1];
      if (!section) return '""';
      // Not MIN(1,...): inside ARRAYFORMULA, MIN takes the smallest value in the whole column.
      var done = '(' + section.tasks.map(function (id) { return countTicks_('"' + id + '"'); }).join('+') + ')';
      var n = section.tasks.length;
      return 'IF(' + done + '>=' + n + ',1,' + done + '/' + n + ')';
    });
    f[col_(c.section(k)) + '2'] = perStudent('CHOOSE(' + show + ',' + branches.join(',') + ')');
  }
  f[col_(c.extras) + '2'] = perStudent(countTicks_('CHOOSE(' + show + ',' + lessons.map(function (lesson) { return '"' + lesson.id + '-EXTRA-*"'; }).join(',') + ')'));
  var finishedParts = [];
  for (var s = 1; s <= c.width; s++) finishedParts.push('(IFERROR(' + colRange_(c.section(s)) + '*1,0)>=1)');
  f[col_(c.finished) + '2'] = perStudent(finishedParts.join('+'));
  var lessonColumns = ['B2:B', colRange_(c.lessonDone)];
  for (var t = 1; t <= c.width; t++) lessonColumns.push(colRange_(c.section(t)));
  f[col_(c.lessonTable) + '2'] = sorted(lessonColumns.concat([colRange_(c.extras), 'C2:C']), c.width + 4);

  // "Most are up to": the section after the number most students have finished.
  var titleRow = 'INDEX($' + col_(c.titles) + '$2:$' + col_(c.last) + '$' + (lessons.length + 1) + ',' + show + ',0)';
  var middle = 'ROUND(IFERROR(MEDIAN(FILTER(' + colRange_(c.finished) + ',' + inClass + ',D2:D=TRUE)),0))+1';
  f[col_(c.show) + '3'] = '=IFERROR(IF(' + middle + '>COUNTIF(' + titleRow + ',"?*"),"Finished",'
    + middle + '&". "&INDEX(' + titleRow + ',1,' + middle + ')),"")';
  return f;

  function dataRefLocal_(column) { return '$' + col_(column) + '$2'; }
}

/** Plain values for the hidden data tab: labels, totals, choices, colours and section titles. */
function dashboardDataValues_(model) {
  var lessons = model.lessons;
  var c = dashboardLayout_(model);
  var blocks = [];
  blocks.push({ row: 1, column: c.totals, values: [lessons.map(function (lesson) { return lesson.id + ' tasks'; })] });
  blocks.push({ row: 2, column: c.totals, values: [lessons.map(function (lesson) { return lesson.total; })] });
  blocks.push({ row: 1, column: c.show, values: [['Lesson shown', 'Show choices', 'Colours']] });
  // The Show choices, each with its lesson's colour beside it. "All lessons" has no colour.
  blocks.push({ row: 2, column: c.showList, values: [[DASHBOARD.ALL_LESSONS, '']].concat(lessons.map(function (lesson) {
    return [lesson.title, lesson.colour];
  })) });
  blocks.push({ row: 1, column: c.titles, values: [Array.apply(null, Array(c.width)).map(function (x, k) { return 'Section ' + (k + 1); })] });
  blocks.push({ row: 2, column: c.titles, values: lessons.map(function (lesson) {
    var row = [];
    for (var k = 0; k < c.width; k++) row.push(lesson.sections[k] ? lesson.sections[k].title : '');
    return row;
  }) });
  return blocks;
}

/** Writes the whole hidden data tab. Safe to repeat: it clears the tab first. */
function writeDashboardData_(data, model) {
  // Make the tab wide enough first. If Sheets has to add columns while formulas are being
  // written, it shifts the column references in the formulas already there.
  var needed = dashboardLayout_(model).last + 1;
  var columns = data.getMaxColumns();
  if (columns < needed) data.insertColumnsAfter(columns, needed - columns);
  data.clear();
  var formulas = dashboardDataFormulas_(model);
  Object.keys(formulas).forEach(function (cell) { data.getRange(cell).setFormula(formulas[cell]); });
  dashboardDataValues_(model).forEach(function (block) {
    data.getRange(block.row, block.column, block.values.length, block.values[0].length).setValues(block.values);
  });
}

function rememberDashboard_(model) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('DASHBOARD_SHAPE', JSON.stringify({ lessons: model.lessons.length, width: model.width }));
  props.setProperty('DASHBOARD_COURSE', JSON.stringify(model));
}

/**
 * Keeps the Dashboard matching the course. It only writes when the course has changed, and a
 * problem here must never stop a student loading the app.
 */
function syncDashboard_(book) {
  try {
    var model = dashboardModel_();
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty('DASHBOARD_COURSE') === JSON.stringify(model)) return;
    var data = book.getSheetByName(DASHBOARD.DATA);
    var shape = JSON.parse(props.getProperty('DASHBOARD_SHAPE') || 'null');
    // A new lesson or a much longer lesson changes the Dashboard itself: that needs setupSheets.
    if (!data || !shape || shape.lessons !== model.lessons.length || shape.width !== model.width) return;
    writeDashboardData_(data, model);
    data.hideSheet();
    rememberDashboard_(model);
  } catch (err) {
    Logger.log('The Dashboard was not updated: ' + err);
  }
}

/** The formulas for the summary figures and headings at the top of the Dashboard. */
function dashboardSummaryFormulas_(model) {
  var c = dashboardLayout_(model);
  var shown = dataRef_(c.show, 2);
  var names = dataCol_(c.courseTable);
  var overall = dataCol_(c.courseTable + 1);
  var lessonDone = dataCol_(c.lessonTable + 1);
  var counted = model.lessons.filter(function (lesson) { return !lesson.optional; }).length;
  var classCell = DASHBOARD.CLASS_CELL;
  return {
    B2: '=IF(' + classCell + '="","Choose a class below",IF(' + shown + '=0,IF(' + classCell + '="' + DASHBOARD.ALL_CLASSES + '",'
      + classCell + ',' + classCell + '&" progress"),' + DASHBOARD.SHOW_CELL + '&"  ·  "&' + classCell + '))',
    B7: '=COUNTIF(' + names + ',"?*")',
    D6: '=IF(' + shown + '=0,"Average","Finished this lesson")',
    D7: '=IF(' + shown + '=0,TEXT(IFERROR(AVERAGE(' + overall + '),0),"0%"),COUNTIF(' + lessonDone + ',">=1"))',
    F6: '=IF(' + shown + '=0,"Finished Lessons 1 to ' + counted + '","Most are up to")',
    F7: '=IF(' + shown + '=0,COUNTIF(' + overall + ',">=1"),' + dataRef_(c.show, 3) + ')',
    tooMany: '=IF(B7>' + DASHBOARD.ROWS + ',"Only the first ' + DASHBOARD.ROWS + ' students are shown.","")'
  };
}

/** The table's headings, then the whole-class row, as formulas. */
function dashboardHeadFormulas_(model) {
  var c = dashboardLayout_(model);
  var shown = dataRef_(c.show, 2);
  var titles = "'" + DASHBOARD.DATA + "'!$" + col_(c.titles) + '$2:$' + col_(c.last) + '$' + (model.lessons.length + 1);
  var showList = "'" + DASHBOARD.DATA + "'!$" + col_(c.showList) + '$3:$' + col_(c.showList) + '$' + (model.lessons.length + 2);
  var first = DASHBOARD.FIRST_ROW;
  // Every cell here is written as a formula, so plain text needs ="...".
  var head = [
    '="Student"',
    '=IF($' + DASHBOARD.CLASS_CELL.replace(/(\d+)/, '$$$1') + '="' + DASHBOARD.ALL_CLASSES + '","Class","")',
    '=IF(' + shown + '=0,"Overall","This lesson")',
    ''
  ];
  var whole = [
    '=IF($B$' + first + '="","","Whole class")',
    '',
    '=IF($B$' + first + '="","",SPARKLINE(E' + DASHBOARD.CLASS_ROW + ',{"charttype","bar";"max",1;"color1","' + DASHBOARD.INK + '"}))',
    '=IF($B$' + first + '="","",IF(' + shown + '=0,AVERAGE(' + dataCol_(c.courseTable + 1) + '),AVERAGE(' + dataCol_(c.lessonTable + 1) + ')))'
  ];
  for (var k = 1; k <= c.width; k++) {
    var column = col_(5 + k);
    head.push('=IF(' + shown + '=0,IFERROR(INDEX(' + showList + ',' + k + ',1)&"",""),IF(INDEX(' + titles + ',MAX(1,' + shown + '),' + k + ')="","",'
      + k + '&". "&INDEX(' + titles + ',MAX(1,' + shown + '),' + k + ')))');
    var courseColumn = k <= model.lessons.length ? dataCol_(c.courseTable + 1 + k) : null;
    whole.push('=IF(OR($B$' + first + '="",' + column + '$' + DASHBOARD.HEADER_ROW + '=""),"",IF(' + shown + '=0,'
      + (courseColumn ? 'COUNTIF(' + courseColumn + ',">=1")' : '0') + ',COUNTIF(' + dataCol_(c.lessonTable + 1 + k) + ',">=1"))/$B$7)');
  }
  head.push('=IF(' + shown + '=0,"","Extras")');
  whole.push('');
  return { head: head, whole: whole };
}

/** The formulas for one student row of the Dashboard's table. */
function dashboardRowFormulas_(index, model) {
  var c = dashboardLayout_(model);
  var row = DASHBOARD.FIRST_ROW + index;
  var dataRow = 2 + index;
  var shown = dataRef_(c.show, 2);
  var cell = function (column) { return "'" + DASHBOARD.DATA + "'!" + col_(column) + dataRow; };
  var pick = function (courseColumn, lessonColumn) { return 'IF(' + shown + '=0,' + cell(courseColumn) + ',' + cell(lessonColumn) + ')'; };
  var colours = "'" + DASHBOARD.DATA + "'!$" + col_(c.colours) + '$2:$' + col_(c.colours) + '$' + (model.lessons.length + 2);
  var lessonColour = 'INDEX(' + colours + ',' + shown + '+1)';
  var bar = function (value, colour) {
    return 'SPARKLINE(' + value + ',{"charttype","bar";"max",1;"color1",' + colour + '})';
  };
  var cells = [
    '=IF(' + pick(c.courseTable, c.lessonTable) + '="","",' + pick(c.courseTable, c.lessonTable) + ')',
    '=IF($' + DASHBOARD.CLASS_CELL.replace(/(\d+)/, '$$$1') + '="' + DASHBOARD.ALL_CLASSES + '",' + pick(c.courseTable + c.lessonCount + 2, c.lessonTable + c.width + 3) + ',"")',
    '=IF($B' + row + '="","",' + bar('$E' + row, 'IF(' + shown + '=0,"' + DASHBOARD.INK + '",' + lessonColour + ')') + ')',
    '=IF($B' + row + '="","",' + pick(c.courseTable + 1, c.lessonTable + 1) + ')'
  ];
  for (var k = 1; k <= c.width; k++) {
    var header = col_(5 + k) + '$' + DASHBOARD.HEADER_ROW;
    var courseValue = k <= c.lessonCount ? cell(c.courseTable + 1 + k) : '0';
    var value = 'IF(' + shown + '=0,' + courseValue + ',' + cell(c.lessonTable + 1 + k) + ')';
    var colour = 'IF(' + shown + '=0,INDEX(' + colours + ',' + (k + 1) + '),IF(' + value + '>=1,"' + DASHBOARD.FINISHED + '",' + lessonColour + '))';
    cells.push('=IF(OR($B' + row + '="",' + header + '=""),"",' + bar(value, colour) + ')');
  }
  cells.push('=IF(OR($B' + row + '="",' + shown + '=0),"",REPT("★",' + cell(c.lessonTable + c.width + 2) + '))');
  return cells;
}

/** Columns the Dashboard tab needs: a margin, the table, and one spare. */
function tableWidthNeeded_(model) {
  return 1 + 4 + model.width + 1 + 1;
}

function buildDashboard_(book) {
  var model = dashboardModel_();
  var c = dashboardLayout_(model);
  var data = book.getSheetByName(DASHBOARD.DATA) || book.insertSheet(DASHBOARD.DATA);
  var dash = book.getSheetByName(DASHBOARD.NAME) || book.insertSheet(DASHBOARD.NAME);

  // Keeps the teacher's choices when setup runs again.
  var classes = readRows_(book, SHEETS.CLASSES);
  var chosenClass = dash.getRange(DASHBOARD.CLASS_CELL).getValue() || (classes.length ? classes[0][0] : '');
  var chosenSort = dash.getRange(DASHBOARD.SORT_CELL).getValue() || DASHBOARD.SORT_PROGRESS;
  var chosenShow = dash.getRange(DASHBOARD.SHOW_CELL).getValue() || DASHBOARD.ALL_LESSONS;

  writeDashboardData_(data, model);
  rememberDashboard_(model);
  data.hideSheet();

  dash.clear();
  var dashColumns = dash.getMaxColumns();
  if (dashColumns < tableWidthNeeded_(model)) dash.insertColumnsAfter(dashColumns, tableWidthNeeded_(model) - dashColumns);
  dash.setHiddenGridlines(true);
  dash.setTabColor(DASHBOARD.INK);
  var tableWidth = 4 + c.width + 1;
  [24, 190, 110, 200, 70].concat(Array.apply(null, Array(c.width)).map(function () { return 118; })).concat([80]).forEach(function (width, i) {
    dash.setColumnWidth(i + 1, width);
  });

  // Title band
  dash.getRange(1, 1, 2, tableWidth + 1).setBackground(DASHBOARD.INK).setFontColor('#ffffff');
  dash.getRange('B1').setValue('Computing Foundations').setFontSize(26).setFontWeight('bold');
  dash.setRowHeight(1, 52);
  dash.setRowHeight(2, 32);
  var summary = dashboardSummaryFormulas_(model);
  dash.getRange('B2').setFormula(summary.B2).setFontSize(14);

  // Choices
  var showList = data.getRange(2, c.showList, model.lessons.length + 1, 1);
  [['B4', 'Class'], ['E4', 'Sort by'], ['H4', 'Show']].forEach(function (label) {
    dash.getRange(label[0]).setValue(label[1]).setFontWeight('bold').setHorizontalAlignment('right');
  });
  var classCell = dash.getRange(DASHBOARD.CLASS_CELL);
  classCell.setValue(chosenClass).setBackground(DASHBOARD.PALE).setFontWeight('bold');
  classCell.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(data.getRange(col_(c.classList) + '2:' + col_(c.classList)), true)
    .setAllowInvalid(true)
    .build());
  var sortCell = dash.getRange(DASHBOARD.SORT_CELL);
  sortCell.setValue(chosenSort).setBackground(DASHBOARD.PALE).setFontWeight('bold');
  sortCell.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList([DASHBOARD.SORT_PROGRESS, DASHBOARD.SORT_NAME, DASHBOARD.SORT_CLASS], true)
    .setAllowInvalid(false)
    .build());
  var showCell = dash.getRange(DASHBOARD.SHOW_CELL);
  showCell.setValue(chosenShow).setBackground(DASHBOARD.PALE).setFontWeight('bold');
  showCell.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(showList, true)
    .setAllowInvalid(true)
    .build());

  // Summary figures, with labels that change with Show
  dash.getRange('B6').setValue('Students joined');
  dash.getRange('D6').setFormula(summary.D6);
  dash.getRange('F6').setFormula(summary.F6);
  dash.getRange('B6:F6').setFontColor(DASHBOARD.MUTED).setFontWeight('bold');
  ['B7', 'D7', 'F7'].forEach(function (a1) {
    dash.getRange(a1).setFormula(summary[a1]).setFontSize(22).setFontWeight('bold').setFontColor(DASHBOARD.INK).setHorizontalAlignment('left');
  });
  dash.setRowHeight(7, 42);

  // Table headings and the whole-class row
  var head = dashboardHeadFormulas_(model);
  dash.getRange(DASHBOARD.HEADER_ROW, 2, 1, tableWidth).setFormulas([head.head])
    .setBackground(DASHBOARD.INK).setFontColor('#ffffff').setFontWeight('bold').setWrap(true).setVerticalAlignment('top');
  dash.setRowHeight(DASHBOARD.HEADER_ROW, 44);
  dash.getRange(DASHBOARD.CLASS_ROW, 2, 1, tableWidth).setFormulas([head.whole])
    .setBackground(DASHBOARD.CLASS_ROW_FILL).setFontWeight('bold').setFontColor(DASHBOARD.INK).setVerticalAlignment('middle');
  dash.getRange(DASHBOARD.CLASS_ROW, 5).setNumberFormat('0%').setHorizontalAlignment('right');
  dash.getRange(DASHBOARD.CLASS_ROW, 6, 1, c.width).setNumberFormat('0%" done"').setHorizontalAlignment('center');
  dash.setRowHeight(DASHBOARD.CLASS_ROW, 32);

  // Students
  var rows = [];
  for (var i = 0; i < DASHBOARD.ROWS; i++) rows.push(dashboardRowFormulas_(i, model));
  var table = dash.getRange(DASHBOARD.FIRST_ROW, 2, DASHBOARD.ROWS, tableWidth);
  table.setFormulas(rows).setFontSize(13).setVerticalAlignment('middle').setFontColor(DASHBOARD.INK);
  dash.setRowHeights(DASHBOARD.FIRST_ROW, DASHBOARD.ROWS, 30);
  dash.getRange(DASHBOARD.FIRST_ROW, 2, DASHBOARD.ROWS, 1).setFontWeight('bold');
  dash.getRange(DASHBOARD.FIRST_ROW, 5, DASHBOARD.ROWS, 1).setNumberFormat('0%').setFontWeight('bold').setHorizontalAlignment('right');
  dash.getRange(DASHBOARD.FIRST_ROW, 6 + c.width, DASHBOARD.ROWS, 1).setFontColor(DASHBOARD.STAR).setHorizontalAlignment('right');
  dash.getRange(DASHBOARD.FIRST_ROW + DASHBOARD.ROWS, 2).setFormula(summary.tooMany).setFontColor(DASHBOARD.MUTED);

  dash.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($B' + DASHBOARD.FIRST_ROW + '<>"",$E' + DASHBOARD.FIRST_ROW + '>=1)')
      .setBackground(DASHBOARD.DONE)
      .setRanges([table])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($B' + DASHBOARD.FIRST_ROW + '<>"",ISEVEN(ROW()))')
      .setBackground(DASHBOARD.PALE)
      .setRanges([table])
      .build()
  ]);

  dash.setFrozenRows(DASHBOARD.CLASS_ROW);
  book.setActiveSheet(dash);
  book.moveActiveSheet(1);
}
