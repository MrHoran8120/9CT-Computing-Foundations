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
