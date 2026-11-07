/**
 * Builds the Dashboard tab that a teacher can show on the board. It runs from setupSheets.
 *
 * Everything on it is a live formula, so it updates as students tick tasks. It shows first
 * names and last initials only. Emails stay in the hidden data tab, because the whole class
 * can see the Dashboard. Extra challenges don't count, and an optional lesson doesn't count
 * towards the overall figure.
 *
 * Changing the course needs no work here. Progress is counted by each lesson's task ID prefix,
 * and syncDashboard_ corrects the task totals the next time a student opens the app. Only adding
 * or removing a whole lesson changes the layout, which needs setupSheets to run again.
 */

var DASHBOARD = {
  NAME: 'Dashboard',
  DATA: 'Dashboard data',
  HEADER_ROW: 9,
  FIRST_ROW: 10,
  ROWS: 200,
  CLASS_CELL: 'C4',
  SORT_CELL: 'F4',
  SORT_PROGRESS: 'Most progress',
  SORT_NAME: 'Name',
  SORT_CLASS: 'Class',
  ALL_CLASSES: 'All classes',
  INK: '#16213a',
  MUTED: '#55617a',
  PALE: '#f1f4fa',
  DONE: '#d7f0e0',
  BARS: ['#1f5fd6', '#b4540a', '#0a7d6c', '#a8327a']
};

/** Lists each lesson with the number of tasks that count towards progress. */
function lessonTotals_() {
  return COURSE.map(function (lesson) {
    var total = 0;
    lesson.sections.forEach(function (section) {
      if (!section.extension) total += section.tasks.length;
    });
    return { id: lesson.id, title: lesson.optional ? 'Lesson ' + lesson.id.slice(1) + ' (optional)' : 'Lesson ' + lesson.id.slice(1), total: total, optional: !!lesson.optional };
  });
}

function columnLetter_(number) {
  return String.fromCharCode(64 + number);
}

/** The data tab holds each lesson's total in row 2, to the right of the sorted table. */
function totalsColumn_(lessons) {
  return 5 + lessons.length + 2 + lessons.length + 4;
}

/** The class dropdown's choices sit to the right of the totals. */
function classListColumn_(lessons) {
  return columnLetter_(totalsColumn_(lessons) + lessons.length + 1);
}

function totalCell_(lessons, i) {
  return '$' + columnLetter_(totalsColumn_(lessons) + i) + '$2';
}

function writeDashboardTotals_(data, lessons) {
  var first = totalsColumn_(lessons);
  data.getRange(1, first, 1, lessons.length).setValues([lessons.map(function (lesson) { return lesson.id + ' tasks'; })]);
  data.getRange(2, first, 1, lessons.length).setValues([lessons.map(function (lesson) { return lesson.total; })]);
}

function rememberDashboardTotals_(lessons) {
  PropertiesService.getScriptProperties().setProperty('DASHBOARD_TOTALS', JSON.stringify(lessons));
}

/**
 * Keeps the Dashboard's totals matching the course. It only writes when the course has changed,
 * and a problem here must never stop a student loading the app.
 */
function syncDashboard_(book) {
  try {
    var lessons = lessonTotals_();
    var props = PropertiesService.getScriptProperties();
    var saved = props.getProperty('DASHBOARD_TOTALS');
    if (saved === JSON.stringify(lessons)) return;
    var data = book.getSheetByName(DASHBOARD.DATA);
    if (!data || !saved || JSON.parse(saved).length !== lessons.length) return;
    writeDashboardTotals_(data, lessons);
    rememberDashboardTotals_(lessons);
  } catch (err) {
    Logger.log('The Dashboard totals were not updated: ' + err);
  }
}

/** The formulas for the hidden data tab, keyed by cell. */
function dashboardDataFormulas_(lessons) {
  var formulas = {
    A2: '=ARRAYFORMULA(IF(Students!A2:A="","",Students!A2:A))',
    B2: '=ARRAYFORMULA(IF(Students!A2:A="","",REGEXREPLACE(TO_TEXT(Students!B2:B),"^\\s*(\\S+).*\\s(\\S)\\S*\\s*$","$1 $2.")))',
    C2: '=ARRAYFORMULA(IF(Students!A2:A="","",TO_TEXT(Students!C2:C)))',
    D2: '=ARRAYFORMULA(REGEXMATCH(LOWER(TRIM(TO_TEXT(Students!F2:F))),"^(false|no)?$"))'
  };

  var counted = [];
  lessons.forEach(function (lesson, i) {
    var column = columnLetter_(5 + i);
    var count = function (pattern) {
      return 'COUNTIFS(Progress!$A$2:$A,Students!A2:A,Progress!$F$2:$F,TRUE,Progress!$E$2:$E,"' + pattern + '")';
    };
    var done = '(' + count(lesson.id + '-*') + '-' + count(lesson.id + '-EXTRA-*') + ')';
    var total = totalCell_(lessons, i);
    formulas[column + '2'] = '=ARRAYFORMULA(IF(Students!A2:A="","",IF(' + done + '>=' + total + ',1,' + done + '/' + total + ')))';
    if (!lesson.optional) counted.push({ column: column, total: total });
  });

  var weighted = counted.map(function (item) { return item.column + '2:' + item.column + '*' + item.total; }).join('+');
  var allTasks = counted.map(function (item) { return item.total; }).join('+');
  var overall = columnLetter_(5 + lessons.length);
  formulas[overall + '2'] = '=ARRAYFORMULA(IF(Students!A2:A="","",(' + weighted + ')/(' + allTasks + ')))';

  var lessonRanges = lessons.map(function (lesson, i) {
    var column = columnLetter_(5 + i);
    return column + '2:' + column;
  });
  var sortCell = 'Dashboard!$' + DASHBOARD.SORT_CELL[0] + '$' + DASHBOARD.SORT_CELL.slice(1);
  var classCell = 'Dashboard!$' + DASHBOARD.CLASS_CELL[0] + '$' + DASHBOARD.CLASS_CELL.slice(1);
  var spill = columnLetter_(5 + lessons.length + 2);
  var classColumn = 3 + lessons.length;
  var sortColumn = 'IF(' + sortCell + '="' + DASHBOARD.SORT_NAME + '",1,IF(' + sortCell + '="' + DASHBOARD.SORT_CLASS + '",' + classColumn + ',2))';
  var inClass = 'IF(' + classCell + '="' + DASHBOARD.ALL_CLASSES + '",C2:C<>"",C2:C=TO_TEXT(' + classCell + '))';
  formulas[spill + '2'] = '=IFERROR(ARRAYFORMULA(SORT(FILTER({B2:B,' + overall + '2:' + overall + ',' + lessonRanges.join(',') + ',C2:C},'
    + inClass + ',D2:D=TRUE),' + sortColumn + ',' + sortCell + '<>"' + DASHBOARD.SORT_PROGRESS + '",2,FALSE,1,TRUE)))';
  formulas[classListColumn_(lessons) + '2'] = '={"' + DASHBOARD.ALL_CLASSES + '";IFERROR(FILTER(TO_TEXT(Classes!A2:A),Classes!A2:A<>""))}';
  return formulas;
}

/** The formulas for one row of the Dashboard's table. */
function dashboardRowFormulas_(index, lessons) {
  var row = DASHBOARD.FIRST_ROW + index;
  var dataRow = 2 + index;
  var first = 5 + lessons.length + 2;
  var data = function (offset) {
    return "'" + DASHBOARD.DATA + "'!" + columnLetter_(first + offset) + dataRow;
  };
  var bar = function (offset, colour) {
    return '=IF($B' + row + '="","",SPARKLINE(' + data(offset) + ',{"charttype","bar";"max",1;"color1","' + colour + '"}))';
  };
  var cells = [
    '=IF(' + data(0) + '="","",' + data(0) + ')',
    '=IF($' + DASHBOARD.CLASS_CELL[0] + '$' + DASHBOARD.CLASS_CELL.slice(1) + '="' + DASHBOARD.ALL_CLASSES + '",' + data(2 + lessons.length) + ',"")',
    bar(1, DASHBOARD.INK),
    '=IF($B' + row + '="","",' + data(1) + ')'
  ];
  lessons.forEach(function (lesson, i) {
    cells.push(bar(2 + i, DASHBOARD.BARS[i % DASHBOARD.BARS.length]));
  });
  return cells;
}

/** The formulas for the summary figures at the top of the Dashboard. */
function dashboardSummaryFormulas_(lessons) {
  var first = 5 + lessons.length + 2;
  var data = function (offset) {
    var column = columnLetter_(first + offset);
    return "'" + DASHBOARD.DATA + "'!" + column + '2:' + column;
  };
  var joined = 'COUNTIF(' + data(0) + ',"?*")';
  return {
    B7: '=' + joined,
    D7: '=IFERROR(AVERAGE(' + data(1) + '),0)',
    F7: '=COUNTIF(' + data(1) + ',">=1")',
    B2: '=IF(' + DASHBOARD.CLASS_CELL + '="","Choose a class below",IF(' + DASHBOARD.CLASS_CELL + '="' + DASHBOARD.ALL_CLASSES + '",' + DASHBOARD.CLASS_CELL + ',' + DASHBOARD.CLASS_CELL + '&" progress"))',
    tooMany: '=IF(' + joined + '>' + DASHBOARD.ROWS + ',"Only the first ' + DASHBOARD.ROWS + ' students are shown.","")'
  };
}

function buildDashboard_(book) {
  var lessons = lessonTotals_();
  var data = book.getSheetByName(DASHBOARD.DATA) || book.insertSheet(DASHBOARD.DATA);
  var dash = book.getSheetByName(DASHBOARD.NAME) || book.insertSheet(DASHBOARD.NAME);

  // Keeps the teacher's choices when setup runs again.
  var classes = readRows_(book, SHEETS.CLASSES);
  var chosenClass = dash.getRange(DASHBOARD.CLASS_CELL).getValue() || (classes.length ? classes[0][0] : '');
  var chosenSort = dash.getRange(DASHBOARD.SORT_CELL).getValue() || DASHBOARD.SORT_PROGRESS;

  data.clear();
  var dataFormulas = dashboardDataFormulas_(lessons);
  Object.keys(dataFormulas).forEach(function (cell) {
    data.getRange(cell).setFormula(dataFormulas[cell]);
  });
  writeDashboardTotals_(data, lessons);
  rememberDashboardTotals_(lessons);
  data.hideSheet();

  dash.clear();
  dash.setHiddenGridlines(true);
  dash.setTabColor(DASHBOARD.INK);
  [24, 190, 110, 300, 70].concat(lessons.map(function () { return 130; })).forEach(function (width, i) {
    dash.setColumnWidth(i + 1, width);
  });
  var lastColumn = 5 + lessons.length;

  // Title band
  dash.getRange(1, 1, 2, lastColumn + 1).setBackground(DASHBOARD.INK).setFontColor('#ffffff');
  dash.getRange('B1').setValue('Computing Foundations').setFontSize(26).setFontWeight('bold');
  dash.setRowHeight(1, 52);
  dash.setRowHeight(2, 32);
  var summary = dashboardSummaryFormulas_(lessons);
  dash.getRange('B2').setFormula(summary.B2).setFontSize(14);

  // Choices
  dash.getRange('B4').setValue('Class').setFontWeight('bold').setHorizontalAlignment('right');
  dash.getRange('E4').setValue('Sort by').setFontWeight('bold').setHorizontalAlignment('right');
  var classCell = dash.getRange(DASHBOARD.CLASS_CELL);
  classCell.setValue(chosenClass).setBackground(DASHBOARD.PALE).setFontWeight('bold');
  classCell.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(data.getRange(classListColumn_(lessons) + '2:' + classListColumn_(lessons)), true)
    .setAllowInvalid(true)
    .build());
  var sortCell = dash.getRange(DASHBOARD.SORT_CELL);
  sortCell.setValue(chosenSort).setBackground(DASHBOARD.PALE).setFontWeight('bold');
  sortCell.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList([DASHBOARD.SORT_PROGRESS, DASHBOARD.SORT_NAME, DASHBOARD.SORT_CLASS], true)
    .setAllowInvalid(false)
    .build());

  // Summary figures
  var overallLessons = lessons.filter(function (lesson) { return !lesson.optional; }).length;
  [['B', 'Students joined', '0'],
    ['D', 'Average', '0%'],
    ['F', 'Finished Lessons 1 to ' + overallLessons, '0']].forEach(function (card) {
    dash.getRange(card[0] + '6').setValue(card[1]).setFontColor(DASHBOARD.MUTED).setFontWeight('bold');
    dash.getRange(card[0] + '7').setFormula(summary[card[0] + '7']).setNumberFormat(card[2])
      .setFontSize(24).setFontWeight('bold').setFontColor(DASHBOARD.INK).setHorizontalAlignment('left');
  });
  dash.setRowHeight(7, 42);

  // Table
  var headers = ['Student', '', 'Overall', ''].concat(lessons.map(function (lesson) { return lesson.title; }));
  dash.getRange(DASHBOARD.HEADER_ROW, 2, 1, headers.length).setValues([headers])
    .setBackground(DASHBOARD.INK).setFontColor('#ffffff').setFontWeight('bold').setWrap(true).setVerticalAlignment('middle');
  dash.getRange(DASHBOARD.HEADER_ROW, 3).setFormula('=IF($C$4="' + DASHBOARD.ALL_CLASSES + '","Class","")');
  dash.setRowHeight(DASHBOARD.HEADER_ROW, 38);

  var rows = [];
  for (var i = 0; i < DASHBOARD.ROWS; i++) rows.push(dashboardRowFormulas_(i, lessons));
  var table = dash.getRange(DASHBOARD.FIRST_ROW, 2, DASHBOARD.ROWS, headers.length);
  table.setFormulas(rows).setFontSize(13).setVerticalAlignment('middle').setFontColor(DASHBOARD.INK);
  dash.setRowHeights(DASHBOARD.FIRST_ROW, DASHBOARD.ROWS, 30);
  var percent = dash.getRange(DASHBOARD.FIRST_ROW, 5, DASHBOARD.ROWS, 1);
  percent.setNumberFormat('0%').setFontWeight('bold').setHorizontalAlignment('right');
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

  dash.setFrozenRows(DASHBOARD.HEADER_ROW);
  book.setActiveSheet(dash);
  book.moveActiveSheet(1);
}
