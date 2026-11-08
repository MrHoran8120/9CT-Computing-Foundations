/**
 * Simple drawings used in the lessons. They're drawn in code so they stay sharp, follow the
 * light and dark themes, and contain nothing from outside this project. Real screenshots can
 * replace them later. All text here is fixed, and none of it comes from students.
 */

function svgOpen_(width, height) {
  return '<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">';
}

function box_(x, y, w, h, kind) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" class="d-' + (kind || 'panel') + '"/>';
}

function label_(x, y, text, kind, anchor) {
  return '<text x="' + x + '" y="' + y + '" class="d-' + (kind || 'text') + '" text-anchor="' + (anchor || 'start') + '">' + text + '</text>';
}

function arrow_(x1, y1, x2, y2) {
  var head = x2 >= x1 ? -8 : 8;
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="d-arrow"/>'
    + '<path d="M' + x2 + ' ' + y2 + ' l' + head + ' -5 v10 z" class="d-arrowhead"/>';
}

function folder_(x, y) {
  return '<path d="M' + x + ' ' + (y + 4) + ' h9 l3 3 h14 v15 h-26 z" class="d-folder"/>';
}

function fileIcon_(x, y) {
  return '<path d="M' + x + ' ' + y + ' h14 l6 6 v18 h-20 z" class="d-file"/>';
}

function callout_(x, y, number) {
  return '<circle cx="' + x + '" cy="' + y + '" r="11" class="d-accent"/>'
    + '<text x="' + x + '" y="' + (y + 5) + '" class="d-on-accent" text-anchor="middle">' + number + '</text>';
}

function appFileDiagram_() {
  return svgOpen_(620, 190)
    + label_(95, 24, 'Files: your work', 'heading', 'middle') + label_(420, 24, 'Apps: the tools that open it', 'heading', 'middle')
    + box_(20, 40, 170, 56) + fileIcon_(34, 54) + label_(66, 74, 'essay.docx')
    + arrow_(198, 68, 300, 68)
    + box_(310, 40, 220, 56, 'accent-soft') + label_(420, 74, 'Word', 'text', 'middle')
    + box_(20, 116, 170, 56) + fileIcon_(34, 130) + label_(66, 150, 'beach.jpg')
    + arrow_(198, 144, 300, 144)
    + box_(310, 116, 220, 56, 'accent-soft') + label_(420, 150, 'Photos or Preview', 'text', 'middle')
    + '</svg>';
}

function windowDiagram_(os) {
  var isWin = os === 'win';
  var sidebar = isWin ? ['Home', 'Desktop', 'Downloads', 'Documents', 'Pictures'] : ['Recents', 'Applications', 'Desktop', 'Documents', 'Downloads'];
  var svg = svgOpen_(620, 300) + box_(10, 10, 600, 280);
  svg += label_(26, 36, isWin ? 'File Explorer' : 'Finder', 'heading');
  svg += box_(26, 50, 568, 30, 'sunk') + label_(38, 70, isWin ? 'This PC  ›  Documents' : 'Documents  (path bar is at the bottom)', 'muted');
  svg += callout_(586, 65, 2);
  svg += box_(26, 90, 150, 186, 'sunk');
  sidebar.forEach(function (name, i) {
    if (name === 'Documents') svg += box_(32, 96 + i * 34, 138, 28, 'accent-soft');
    svg += label_(42, 115 + i * 34, name);
  });
  svg += callout_(176, 100, 1);
  [['Year 9', true], ['Music practice', true], ['notes.docx', false], ['timetable.pdf', false]].forEach(function (item, i) {
    svg += (item[1] ? folder_(200, 98 + i * 40) : fileIcon_(203, 98 + i * 40)) + label_(238, 118 + i * 40, item[0]);
  });
  svg += callout_(586, 110, 3);
  return svg + '</svg>';
}

function olderWindowsExtensionsDiagram_() {
  var svg = svgOpen_(620, 214) + box_(10, 10, 600, 194);
  svg += label_(26, 36, 'File Explorer', 'heading');

  [['File', 26, 46], ['Home', 78, 56], ['Share', 140, 56], ['View', 202, 56]].forEach(function (tab) {
    var isView = tab[0] === 'View';
    svg += box_(tab[1], 46, tab[2], 28, isView ? 'accent-soft' : 'sunk');
    svg += label_(tab[1] + tab[2] / 2, 65, tab[0], isView ? 'heading' : 'muted', 'middle');
  });
  svg += callout_(270, 60, 1);

  svg += box_(26, 80, 568, 110, 'sunk');
  [['Panes', 40, 96], ['Layout', 150, 110], ['Current view', 274, 124]].forEach(function (group) {
    svg += label_(group[1] + group[2] / 2, 112, '...', 'muted', 'middle');
    svg += label_(group[1] + group[2] / 2, 180, group[0], 'muted', 'middle');
  });

  svg += '<line x1="406" y1="88" x2="406" y2="182" class="d-divider"/>';
  [['Item check boxes', 96, false], ['File name extensions', 122, true], ['Hidden items', 148, false]].forEach(function (item) {
    if (item[2]) svg += box_(414, item[1] - 4, 172, 24, 'accent-soft');
    svg += '<rect x="420" y="' + item[1] + '" width="16" height="16" rx="2" class="d-file"/>';
    if (item[2]) svg += '<path d="M423 ' + (item[1] + 8) + ' l4 5 l7 -9" class="d-tick"/>';
    svg += label_(442, item[1] + 13, item[0], item[2] ? 'heading' : 'text');
  });
  svg += label_(498, 180, 'Show/hide', 'muted', 'middle');
  svg += callout_(596, 130, 2);
  return svg + '</svg>';
}

function pathDiagram_(os) {
  var isWin = os === 'win';
  var parts = isWin ? ['C:', 'Users', 'you', 'Documents', 'Year 9', 'photo.jpg'] : ['', 'Users', 'you', 'Documents', 'Year 9', 'photo.jpg'];
  var divider = isWin ? '\\' : '/';
  var width = [46, 72, 58, 118, 80, 104];
  var x = 12;
  var svg = svgOpen_(620, 126);
  parts.forEach(function (part, i) {
    if (part) {
      var isFile = i === parts.length - 1;
      svg += box_(x, 36, width[i], 34, isFile ? 'accent-soft' : 'sunk');
      svg += label_(x + width[i] / 2, 58, part, 'text', 'middle');
      x += width[i];
    }
    if (i < parts.length - 1) {
      svg += label_(x + 7, 60, divider, 'heading', 'middle');
      x += 14;
    }
  });
  svg += label_(12, 22, 'Each ' + (isWin ? 'backslash' : 'slash') + ' means "go inside"', 'muted');
  svg += label_(x - 52, 94, 'the file', 'muted', 'middle') + label_(150, 94, 'the folders you pass through, in order', 'muted');
  return svg + '</svg>';
}

function copyMoveDiagram_() {
  var row = function (y, title, leftHasFile, note) {
    var s = label_(20, y + 22, title, 'heading');
    s += box_(100, y, 180, 60, 'sunk') + folder_(112, y + 8) + label_(146, y + 28, 'Downloads');
    if (leftHasFile) s += fileIcon_(150, y + 32);
    s += arrow_(290, y + 30, 360, y + 30);
    s += box_(370, y, 180, 60, 'sunk') + folder_(382, y + 8) + label_(416, y + 28, 'Science');
    s += fileIcon_(420, y + 32);
    s += label_(100, y + 80, note, 'muted');
    return s;
  };
  return svgOpen_(620, 210)
    + row(10, 'Copy', true, 'Now there are two files. The original stays where it was.')
    + row(110, 'Move', false, 'There is still one file. It is gone from where it was.')
    + '</svg>';
}

function extensionDiagram_() {
  return svgOpen_(620, 104)
    + box_(40, 20, 190, 40, 'sunk') + label_(135, 46, 'prac-report', 'text', 'middle')
    + box_(234, 20, 90, 40, 'accent-soft') + label_(279, 46, '.docx', 'text', 'middle')
    + label_(135, 84, 'the name you choose', 'muted', 'middle')
    + label_(279, 84, 'the extension', 'muted', 'middle')
    + label_(350, 46, 'tells the computer the file type', 'muted')
    + '</svg>';
}

function selectDiagram_(os) {
  var pick = os === 'win' ? 'Ctrl' : 'Command';
  var names = ['notes-art.txt', 'notes-history.txt', 'notes-maths.txt', 'notes-science.txt', 'photo-01.jpg'];
  var panel = function (x, title, chosen, firstNote, lastNote) {
    var s = label_(x, 24, title, 'heading') + box_(x, 36, 270, 190, 'sunk');
    names.forEach(function (name, i) {
      var y = 46 + i * 34;
      if (chosen.indexOf(i) > -1) s += box_(x + 6, y, 258, 28, 'accent-soft');
      s += fileIcon_(x + 14, y + 2) + label_(x + 44, y + 19, name);
    });
    s += label_(x, 248, firstNote, 'muted') + label_(x, 268, lastNote, 'muted');
    return s;
  };
  return svgOpen_(620, 280)
    + panel(20, 'A block of files', [0, 1, 2, 3], 'Click the first file,', 'then Shift + click the last.')
    + panel(330, 'Files that aren\'t together', [1, 3], 'Hold ' + pick + ' and click', 'each file you want.')
    + '</svg>';
}

function saveDialogDiagram_(os) {
  var isWin = os === 'win';
  var svg = svgOpen_(620, 250) + box_(10, 10, 600, 230);
  svg += label_(26, 36, isWin ? 'Save As' : 'Save', 'heading');
  if (isWin) {
    svg += box_(26, 50, 568, 30, 'sunk') + label_(38, 70, 'Documents  ›  Year 9', 'text');
    svg += callout_(586, 65, 1);
    svg += box_(26, 90, 150, 100, 'sunk') + label_(42, 112, 'Desktop') + label_(42, 140, 'Documents') + label_(42, 168, 'Downloads');
    svg += box_(190, 90, 404, 100, 'sunk') + folder_(206, 98) + label_(242, 118, 'Science') + fileIcon_(209, 140) + label_(242, 160, 'my-plan.txt');
    svg += label_(26, 220, 'File name:', 'text') + box_(110, 202, 300, 28, 'accent-soft') + label_(122, 221, 'my-plan.txt');
    svg += callout_(424, 216, 2);
  } else {
    svg += label_(26, 76, 'Save As:', 'text') + box_(100, 56, 300, 30, 'accent-soft') + label_(112, 76, 'my-plan.txt');
    svg += box_(408, 58, 26, 26, 'sunk') + '<path d="M415 68 l6 6 l6 -6" class="d-tick"/>';
    svg += callout_(452, 71, 2);
    svg += label_(26, 122, 'Where:', 'text') + box_(100, 102, 300, 30, 'sunk') + folder_(110, 106) + label_(144, 122, 'Year 9');
    svg += callout_(414, 117, 1);
    svg += label_(26, 168, 'Only see Where? Click the arrow button next to the name to see all your folders.', 'muted');
  }
  svg += box_(494, 202, 100, 28, 'accent') + label_(544, 221, 'Save', 'on-accent', 'middle');
  svg += callout_(586, 190, 3);
  return svg + '</svg>';
}

function versionsDiagram_() {
  var note = function (x, title, lines) {
    var s = box_(x, 30, 230, 130, 'sunk') + fileIcon_(x + 14, 42) + label_(x + 44, 60, title, 'heading');
    lines.forEach(function (line, i) { s += label_(x + 18, 96 + i * 24, line); });
    return s;
  };
  return svgOpen_(620, 210)
    + note(20, 'my-plan.txt', ['Goal 1', 'Goal 2'])
    + arrow_(258, 95, 362, 95) + label_(310, 84, 'new version', 'muted', 'middle')
    + note(370, 'my-plan-v2.txt', ['Goal 1', 'Goal 2', 'Goal 3 (new)'])
    + label_(20, 190, 'Two separate files. Adding Goal 3 to the new version leaves the original as it was.', 'muted')
    + '</svg>';
}

function vscodeDiagram_() {
  var svg = svgOpen_(620, 330) + box_(10, 10, 600, 310);
  // Activity bar
  svg += box_(18, 18, 36, 270, 'sunk');
  [40, 80, 120].forEach(function (y) { svg += '<rect x="26" y="' + (y - 10) + '" width="20" height="20" rx="3" class="d-file"/>'; });
  svg += callout_(36, 160, 1);
  // Explorer
  svg += box_(60, 18, 160, 270, 'sunk') + label_(72, 40, 'PYTHON', 'heading');
  svg += folder_(72, 50) + label_(104, 68, 'guess-game');
  svg += fileIcon_(76, 84) + label_(104, 100, 'broken.py');
  svg += fileIcon_(76, 116) + label_(104, 132, 'compare.py');
  svg += callout_(208, 40, 2);
  // Tabs
  svg += box_(228, 18, 130, 30, 'accent-soft') + label_(240, 38, 'broken.py') + '<circle cx="342" cy="33" r="5" class="d-accent"/>';
  svg += box_(362, 18, 130, 30, 'sunk') + label_(374, 38, 'compare.py') + label_(476, 38, '×', 'muted', 'middle');
  svg += callout_(352, 62, 3);
  // Code with a wavy underline
  ['1', '2', '3'].forEach(function (n, i) { svg += label_(236, 82 + i * 24, n, 'muted'); });
  // A misspelt name is usually a yellow warning in VS Code's default setup.
  svg += label_(256, 82, 'name = input("Name? ")') + label_(256, 106, 'print("Hello, " + name)') + label_(256, 130, 'print(nmae)');
  svg += '<path d="M290 136 q3 4 6 0 t6 0 t6 0 t6 0 t6 0" fill="none" stroke="#d29b00" stroke-width="2"/>';
  svg += callout_(352, 130, 4);
  // Problems panel
  svg += box_(228, 170, 374, 118, 'sunk') + label_(240, 192, 'PROBLEMS', 'heading');
  svg += '<circle cx="246" cy="214" r="5" fill="#d29b00"/>' + label_(258, 219, '"nmae" is not defined   Ln 3');
  svg += callout_(590, 192, 5);
  // Status bar
  svg += box_(18, 294, 584, 20, 'accent');
  return svg + '</svg>';
}

/** A ZIP icon: a file with a zip down its middle. */
function zipIcon_(x, y) {
  var s = '<path d="M' + x + ' ' + y + ' h14 l6 6 v18 h-20 z" class="d-file"/>';
  for (var i = 0; i < 4; i++) s += '<rect x="' + (x + 8) + '" y="' + (y + 3 + i * 5) + '" width="4" height="3" class="d-accent"/>';
  return s;
}

function extractDiagram_(os) {
  var isWin = os === 'win';
  var svg = svgOpen_(620, 210);
  svg += box_(10, 30, 170, 110, 'sunk') + label_(22, 52, 'Downloads', 'heading') + zipIcon_(24, 66) + label_(52, 84, 'bake-sale.zip');
  if (isWin) {
    svg += arrow_(188, 85, 248, 85) + label_(218, 74, 'Extract All', 'muted', 'middle');
    svg += box_(256, 30, 200, 110, 'accent-soft') + label_(268, 52, 'Choose where', 'heading');
    svg += box_(268, 64, 176, 26, 'sunk') + label_(276, 82, '...\\Downloads\\bake-sale', 'text');
    svg += label_(268, 116, 'You can change this', 'muted') + callout_(448, 52, 1);
    svg += arrow_(464, 85, 494, 85);
    svg += box_(500, 30, 110, 110, 'sunk') + folder_(512, 56) + label_(512, 104, 'bake-sale');
    svg += label_(10, 172, 'Windows asks where to put the files. Check the folder before you click Extract.', 'muted');
    svg += label_(10, 196, 'Opening the ZIP without extracting only lets you look. Changes there don\'t stay.', 'muted');
  } else {
    svg += arrow_(188, 85, 268, 85) + label_(228, 74, 'double-click', 'muted', 'middle');
    svg += box_(276, 30, 230, 110, 'accent-soft') + label_(288, 52, 'Downloads', 'heading');
    svg += zipIcon_(292, 66) + label_(320, 84, 'bake-sale.zip') + folder_(290, 100) + label_(322, 118, 'bake-sale');
    svg += callout_(500, 52, 1);
    svg += label_(10, 172, 'Your Mac extracts straight away, into the same folder as the ZIP. It doesn\'t ask where.', 'muted');
    svg += label_(10, 196, 'Then move the folder to where it belongs.', 'muted');
  }
  return svg + '</svg>';
}

function siteDiagram_() {
  var rows = [
    { x: 30, name: 'bake-sale', folder: true },
    { x: 60, name: 'index.html', file: true, page: true },
    { x: 60, name: 'css', folder: true }, { x: 90, name: 'style.css', file: true, path: 'css/style.css' },
    { x: 60, name: 'js', folder: true }, { x: 90, name: 'prices.js', file: true, path: 'js/prices.js' },
    { x: 60, name: 'images', folder: true }, { x: 90, name: 'logo.png', file: true, path: 'images/logo.png' }
  ];
  var svg = svgOpen_(620, 300) + box_(10, 10, 600, 280, 'sunk');
  rows.forEach(function (row, i) {
    var y = 26 + i * 32;
    svg += (row.folder ? folder_(row.x, y) : fileIcon_(row.x + 3, y)) + label_(row.x + 34, y + 18, row.name, row.page ? 'heading' : 'text');
    if (row.path) {
      svg += '<line x1="' + (row.x + 130) + '" y1="' + (y + 13) + '" x2="330" y2="' + (y + 13) + '" class="d-divider"/>';
      svg += box_(336, y, 250, 26, 'accent-soft') + label_(348, y + 18, row.path);
    }
  });
  svg += label_(336, 70, 'Paths written in index.html,', 'muted') + label_(336, 90, 'starting from its own folder', 'muted');
  return svg + '</svg>';
}

function levelsDiagram_() {
  var levels = [
    ['Level 0', 'No AI', ['AI may not be used', 'for this task.']],
    ['Level 1', 'Explanation only', ['AI may explain ideas', 'and errors. Everything', 'you hand in is yours.']],
    ['Level 2', 'Assisted and', ['AI may contribute,', 'if you mark it and', 'record it.']]
  ];
  var svg = svgOpen_(620, 200);
  levels.forEach(function (level, i) {
    var x = 12 + i * 202;
    svg += box_(x, 12, 192, 176, i === 0 ? 'sunk' : 'accent-soft');
    svg += label_(x + 14, 40, level[0], 'heading') + label_(x + 14, 62, level[1], 'heading');
    if (i === 2) svg += label_(x + 14, 84, 'acknowledged', 'heading');
    level[2].forEach(function (line, j) { svg += label_(x + 14, (i === 2 ? 116 : 98) + j * 22, line, 'text'); });
  });
  return svg + '</svg>';
}

function storageDiagram_() {
  return svgOpen_(620, 180)
    + box_(20, 30, 230, 120, 'sunk') + label_(135, 56, 'Local', 'heading', 'middle')
    + label_(135, 84, 'On this laptop only', 'text', 'middle') + label_(135, 110, 'Downloads, Desktop', 'muted', 'middle')
    + arrow_(258, 76, 362, 76)
    + '<line x1="362" y1="104" x2="266" y2="104" class="d-arrow"/><path d="M258 104 l8 -5 v10 z" class="d-arrowhead"/>'
    + label_(310, 66, 'sync', 'muted', 'middle') + label_(310, 124, 'needs internet', 'muted', 'middle')
    + box_(370, 30, 230, 120, 'accent-soft') + label_(485, 56, 'Cloud', 'heading', 'middle')
    + label_(485, 84, 'On a company\'s servers', 'text', 'middle') + label_(485, 110, 'Google Drive, OneDrive, iCloud', 'muted', 'middle')
    + '</svg>';
}
