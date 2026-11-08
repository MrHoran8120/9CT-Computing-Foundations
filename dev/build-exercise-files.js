// Builds the files students download, then packs them into src/ExerciseFiles.gs so the app can
// serve them with no other hosting. Run this after changing anything below.
//   npm run exercise-files
//
// Everything is made up. Files are real, so they open normally and students can look inside
// them. Images are stored in exercise-files/images.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const IMAGES = path.join(ROOT, 'exercise-files', 'images');
const image = (name) => fs.readFileSync(path.join(IMAGES, name));

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const dosDate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number);
  return ((year - 1980) << 9) | (month << 5) | day;
};

// Fixed dates keep the ZIP identical each time it's built. Flag 0x0800 marks UTF-8 names.
function zip(entries) {
  const DOS_TIME = 0x6000;
  const parts = [];
  const central = [];
  let offset = 0;
  entries.forEach(({ name, data, date = '2025-01-01' }) => {
    const nameBytes = Buffer.from(name, 'utf8');
    const packed = zlib.deflateRawSync(data, { level: 9 });
    const shared = Buffer.alloc(26);
    shared.writeUInt16LE(20, 0);
    shared.writeUInt16LE(0x0800, 2);
    shared.writeUInt16LE(8, 4);
    shared.writeUInt16LE(DOS_TIME, 6);
    shared.writeUInt16LE(dosDate(date), 8);
    shared.writeUInt32LE(crc32(data), 10);
    shared.writeUInt32LE(packed.length, 14);
    shared.writeUInt32LE(data.length, 18);
    shared.writeUInt16LE(nameBytes.length, 22);

    const signature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    parts.push(signature, shared, nameBytes, packed);

    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(20, 4);
    shared.copy(record, 6);
    record.writeUInt32LE(offset, 42);
    central.push(record, nameBytes);
    offset += signature.length + shared.length + nameBytes.length + packed.length;
  });
  const centralBytes = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBytes.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, centralBytes, end]);
}

const escapeXml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function docx(lines) {
  const body = lines.map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`).join('');
  const main = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  return zip([
    { name: '[Content_Types].xml', data: Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
    { name: '_rels/.rels', data: Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
    { name: 'word/document.xml', data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${main}"><w:body>${body}</w:body></w:document>`) }
  ]);
}

function pdf(lines) {
  const escape = (text) => text.replace(/([\\()])/g, '\\$1');
  const drawn = lines.map((line, i) => `BT /F1 ${i === 0 ? 20 : 13} Tf 60 ${760 - i * 26} Td (${escape(line)}) Tj ET`).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(drawn)} >>\nstream\n${drawn}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let out = '%PDF-1.4\n';
  const offsets = objects.map((object, i) => {
    const at = Buffer.byteLength(out);
    out += `${i + 1} 0 obj\n${object}\nendobj\n`;
    return at;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((at) => `${String(at).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out);
}

const text = (lines) => Buffer.from(lines.join('\r\n') + '\r\n');

// A small PNG drawn from rectangles, for charts and plans. No text, so it needs no fonts.
function png(width, height, background, rects) {
  const pixels = Buffer.alloc((width * 3 + 1) * height);
  const paint = (x0, y0, w, h, [r, g, b]) => {
    for (let y = Math.max(0, y0); y < Math.min(height, y0 + h); y++) {
      for (let x = Math.max(0, x0); x < Math.min(width, x0 + w); x++) {
        const at = y * (width * 3 + 1) + 1 + x * 3;
        pixels[at] = r; pixels[at + 1] = g; pixels[at + 2] = b;
      }
    }
  };
  paint(0, 0, width, height, background);
  rects.forEach(([x, y, w, h, colour]) => paint(x, y, w, h, colour));
  const chunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; header[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(pixels, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Sam's 15 messy files. Most names give nothing away, so students have to open them.
const samsFiles = {
  'assignment final FINAL v2.docx': docx(['English assignment: Book review', 'Final version', 'This book is about a teenager who starts to question the rules of their town.', 'I would recommend it because the ending made me think for days.']),
  'assignment final.docx': docx(['English assignment: Book review', 'Early draft', 'This book is about a teenager. I still need to write my opinion.']),
  'Untitled.docx': docx(['Science prac report: Heating water', 'Aim: to find out how quickly water heats up.', 'Result: the water reached 80 degrees after four minutes.']),
  'IMG_2041.jpg': image('IMG_2041.jpg'),
  'IMG_2042.jpg': image('IMG_2042.jpg'),
  'scan0001.pdf': pdf(['Maths homework', 'Chapter 3: Fractions', 'Question 1: 1/2 + 1/4 = 3/4', 'Question 2: 2/3 + 1/6 = 5/6']),
  'scan0002.pdf': pdf(['Excursion permission note', 'Year 9 History excursion to the museum', 'Please sign and return by Friday.']),
  'notes.txt': text(['History notes', 'Federation happened in 1901.', 'The six colonies became states.']),
  'notes (1).txt': text(['Science notes', 'Volcanoes form where magma reaches the surface.', 'Ash clouds can travel a long way.']),
  'stuff.csv': text(['Music Club budget,Amount', 'Sheet music,40', 'Concert posters,25', 'Snacks,15']),
  'logo-new.png': image('logo-new.png'),
  'timetable.pdf': pdf(['Year 9 timetable', 'Monday: Maths, English, Science', 'Tuesday: History, Computing, Music']),
  'download.pdf': pdf(['Maths formula sheet', 'Area of a rectangle = length x width', 'Area of a triangle = base x height / 2']),
  'todo.txt': text(['Things to do', 'Return library book', 'Ask about the excursion note', 'Practise for the concert']),
  'asdfgh.txt': text(['Music Club meeting notes', 'Concert is in week 8.', 'We need new posters using the new logo.'])
};

// The date each file was last saved. The "find files fast" challenge in Lesson 1 asks about these.
const samsDates = {
  'timetable.pdf': '2026-01-28',
  'IMG_2042.jpg': '2026-04-18',
  'logo-new.png': '2026-05-11',
  'scan0002.pdf': '2026-05-20',
  'stuff.csv': '2026-06-03',
  'asdfgh.txt': '2026-06-09',
  'notes.txt': '2026-07-27',
  'download.pdf': '2026-08-05',
  'scan0001.pdf': '2026-08-12',
  'IMG_2041.jpg': '2026-08-20',
  'notes (1).txt': '2026-08-24',
  'Untitled.docx': '2026-09-01',
  'todo.txt': '2026-10-14',
  'assignment final.docx': '2026-10-19',
  'assignment final FINAL v2.docx': '2026-10-26'
};

const testFile = text(['Well done, you found the test file.', 'You will use this file again in this lesson.']);
const photo = image('photo.jpg');
const samsZip = zip(Object.keys(samsFiles).map((name) => ({ name: `Sams files/${name}`, data: samsFiles[name], date: samsDates[name] })));

const lessonOne = path.join(ROOT, 'exercise-files', 'lesson-1');
fs.mkdirSync(lessonOne, { recursive: true });
fs.writeFileSync(path.join(lessonOne, 'test-file.txt'), testFile);
fs.writeFileSync(path.join(lessonOne, 'photo.jpg'), photo);
fs.writeFileSync(path.join(lessonOne, 'sams-files.zip'), samsZip);

// "Taking control of your files" (lesson ID L5). Practice files for selecting, comparing
// versions and searching. The speech versions are judged by what's inside them: the newest
// one is missing its ending, so the date alone gives the wrong answer.
const practiceFiles = {
  'notes-art.txt': { data: text(['Art notes', 'Warm colours: red, orange and yellow.', 'Cool colours: blue, green and purple.']), date: '2026-04-20' },
  'notes-history.txt': { data: text(['History notes', 'The First Fleet arrived in 1788.']), date: '2026-04-21' },
  'notes-maths.txt': { data: text(['Maths notes', 'A right angle is 90 degrees.']), date: '2026-04-22' },
  'notes-science.txt': { data: text(['Science notes', 'Plants need light, water and air to grow.']), date: '2026-04-23' },
  'photo-01.jpg': { data: image('photo.jpg'), date: '2026-04-11' },
  'photo-02.jpg': { data: image('IMG_2042.jpg'), date: '2026-04-12' },
  'photo-03.jpg': { data: image('IMG_2041.jpg'), date: '2026-04-13' },
  'poster.png': { data: image('logo-new.png'), date: '2026-04-15' },
  'speech.txt': { data: text([
    'Why our school needs a bike rack',
    'First, more students would ride to school, which is good for their health.',
    'Second, bikes left against the fence get damaged.',
    'Thank you for listening.'
  ]), date: '2026-05-04' },
  'speech-final.txt': { data: text([
    'Why our school needs a bike rack',
    'First, more students would ride to school, which is good for their health.',
    'Second, bikes left against the fence get damaged.',
    'Third, fewer cars at drop-off would make the street safer.',
    'Thank you for listening.'
  ]), date: '2026-05-06' },
  'speech-final-v2.txt': { data: text([
    'Why our school needs a bike rack',
    'First, more students would ride to school, which is good for their health.',
    'Second, bikes left against the fence get damaged.',
    'Third, fewer cars at drop-off would make the street safer.'
  ]), date: '2026-05-08' },
  'old stuff/2025/timetable-2025.pdf': { data: pdf(['Year 8 timetable', 'Monday: Maths, English, Science']), date: '2025-02-03' },
  'old stuff/2026/games/high-scores.txt': { data: text(['High scores', 'Level 1: 3,200', 'Level 2: 4,750']), date: '2026-03-01' },
  'old stuff/2026/misc/excursion-form.pdf': { data: pdf(['Excursion permission form', 'Year 9 Science excursion to the botanic garden', 'Please sign and return by Friday.']), date: '2026-05-12' }
};

// The recovery challenge. Only "Copy of garden report.txt" has every part the task sheet asks
// for. "garden report FINAL.txt" is newer but has no week 4 results or conclusion.
const GREEN = [46, 125, 50];
const BROWN = [141, 110, 99];
const GREY = [97, 97, 97];
const growthChart = png(320, 200, [255, 255, 255], [
  [30, 20, 2, 160, GREY], [30, 178, 280, 2, GREY],
  ...[4, 9, 15, 22].map((h, i) => [50 + i * 66, 178 - h * 7, 24, h * 7, GREEN]),
  ...[3, 6, 9, 12].map((h, i) => [76 + i * 66, 178 - h * 7, 24, h * 7, BROWN])
]);
const gardenPlan = png(320, 200, [214, 194, 160], [
  [20, 20, 130, 70, GREEN], [170, 20, 130, 70, GREEN],
  [20, 110, 130, 70, BROWN], [170, 110, 130, 70, BROWN],
  [150, 0, 20, 200, [189, 189, 189]]
]);
const reportStart = [
  'School garden report',
  '',
  'Aim',
  'To find out whether vegetable seedlings grow taller in the sunny bed or the shady bed.',
  '',
  'Method',
  'We planted 10 bean seedlings in each bed and measured their average height every Friday for four weeks.'
];
const gardenFiles = {
  'task-sheet.pdf': { data: pdf([
    'Science task: School garden report',
    'Your report must include all five parts:',
    '1. A title',
    '2. Aim',
    '3. Method',
    '4. Results for all four weeks, for both beds',
    '5. Conclusion',
    'Keep the growth chart and garden plan with your report.'
  ]), date: '2026-02-23' },
  'garden report.txt': { data: text(reportStart), date: '2026-03-02' },
  'Copy of garden report.txt': { data: text([...reportStart,
    '',
    'Results (average height in cm)',
    'Week 1: sunny 4, shady 3',
    'Week 2: sunny 9, shady 6',
    'Week 3: sunny 15, shady 9',
    'Week 4: sunny 22, shady 12',
    '',
    'Conclusion',
    'The seedlings in the sunny bed grew almost twice as tall as those in the shady bed, so sunlight helped them grow.'
  ]), date: '2026-03-16' },
  'garden report FINAL.txt': { data: text([...reportStart,
    '',
    'Results (average height in cm)',
    'Week 1: sunny 4, shady 3',
    'Week 2: sunny 9, shady 6',
    'Week 3: sunny 15, shady 9'
  ]), date: '2026-03-19' },
  'measurements.csv': { data: text(['Week,Sunny bed (cm),Shady bed (cm)', '1,4,3', '2,9,6', '3,15,9', '4,22,12']), date: '2026-03-13' },
  'IMG_5101.png': { data: growthChart, date: '2026-03-14' },
  'IMG_5102.png': { data: gardenPlan, date: '2026-02-25' },
  'sources.txt': { data: text(['Sources', 'School garden club notes, Term 1.', 'Seed packet: Bush bean, planting guide.']), date: '2026-03-10' },
  'netball-training.pdf': { data: pdf(['Netball training', 'Tuesday and Thursday, 3:30 pm', 'Bring water and a hat.']), date: '2026-03-05' }
};

const zipFolder = (folder, files) => zip(Object.keys(files).map((name) => ({ name: `${folder}/${name}`, data: files[name].data, date: files[name].date })));
const practiceZip = zipFolder('Practice files', practiceFiles);
const gardenZip = zipFolder('Garden project', gardenFiles);

const saveAndFind = path.join(ROOT, 'exercise-files', 'save-and-find');
fs.mkdirSync(saveAndFind, { recursive: true });
fs.writeFileSync(path.join(saveAndFind, 'practice-files.zip'), practiceZip);
fs.writeFileSync(path.join(saveAndFind, 'garden-project.zip'), gardenZip);

// "Working in VS Code" (lesson ID L4). Students open the Python folder in VS Code. broken.py and
// guess-game/guess.py have deliberate mistakes that VS Code underlines without Python installed.
// Nothing reads another file, so moving files around never breaks a program.
const pythonFiles = {
  'compare.py': { data: text([
    '# Open this file in Notepad or TextEdit, then in VS Code. What looks different?',
    'name = input("What is your name? ")',
    'year = 9',
    '',
    'if year == 9:',
    '    print("Welcome to Year 9, " + name + "!")',
    'else:',
    '    print("Hello, " + name + ".")'
  ]), date: '2026-06-01' },
  'broken.py': { data: text([
    '# This program has three mistakes. Fix them one at a time.',
    'name = input("What is your name? ")',
    'print("Hello, " + name',
    '',
    'age = 14',
    'if age > 12',
    '    print("You are a teenager.")',
    '',
    'print("Nice to meet you, " + nmae)'
  ]), date: '2026-06-02' },
  'guess-game/guess.py': { data: text([
    'import random',
    '',
    'secret = random.randint(1, 10)',
    'guess = 0',
    '',
    'print("Guess my number between 1 and 10.")',
    'while guess != secret',
    '    guess = int(input("Your guess: "))',
    '    if guess < secret:',
    '        print("Too low.")',
    '    elif guess > secret:',
    '        pritn("Too high.")',
    '',
    'print("You got it!")'
  ]), date: '2026-06-10' },
  'guess-game/guess-old.py': { data: text([
    'import random',
    '',
    'secret = random.randint(1, 10)',
    'guess = int(input("Guess my number between 1 and 10: "))',
    'print("The number was " + str(secret) + ".")'
  ]), date: '2026-06-03' },
  'guess-game/Untitled-1.py': { data: Buffer.alloc(0), date: '2026-06-08' },
  'guess-game/high-scores.txt': { data: text(['High scores (fewest guesses)', 'Ava: 2', 'Noah: 3']), date: '2026-06-09' },
  'guess-game/ideas.txt': { data: text(['Ideas', 'Count how many guesses it takes.', 'Let the player choose the range.']), date: '2026-06-05' }
};
const pythonZip = zipFolder('Python', pythonFiles);
const vsCode = path.join(ROOT, 'exercise-files', 'vs-code');
fs.mkdirSync(vsCode, { recursive: true });
fs.writeFileSync(path.join(vsCode, 'python-starter.zip'), pythonZip);

// "ZIP files and submission" (lesson ID L2).
// compress-test.zip: a folder of text, which shrinks a lot, and a folder of photos, which barely
// shrinks because photos are already compressed.
const subjects = ['Pizza', 'Pasta', 'Sushi', 'Tacos', 'Curry', 'Salad'];
const surveyRows = ['Student,Year,Favourite lunch,Walks to school'];
for (let i = 1; i <= 2500; i++) surveyRows.push(`Student ${i},Year 9,${subjects[i % subjects.length]},${i % 3 ? 'Yes' : 'No'}`);
const readingLog = [];
for (let week = 1; week <= 400; week++) readingLog.push(`Week ${week}: I read for 20 minutes each night and wrote a short summary of each chapter.`);
const compressFiles = {
  'Notes/survey-results.csv': { data: text(surveyRows), date: '2026-07-01' },
  'Notes/reading-log.txt': { data: text(readingLog), date: '2026-07-02' },
  'Photos/beach.jpg': { data: image('photo.jpg'), date: '2026-07-03' },
  'Photos/volcano.jpg': { data: image('IMG_2041.jpg'), date: '2026-07-03' },
  'Photos/holiday.jpg': { data: image('IMG_2042.jpg'), date: '2026-07-03' }
};

// bake-sale.zip has four faults for students to repair:
//  1. The logo uses a full path from Sam's laptop.
//  2. index.html expects css/style.css, but style.css is loose in the main folder.
//  3. js/prices.js was saved as prices.js.txt.
//  4. The team photo isn't in the ZIP. It's a separate download, team-photo.png.
const PINK = [236, 112, 160];
const CREAM = [255, 244, 222];
const BROWN_DARK = [120, 72, 40];
const bakeLogo = png(240, 160, CREAM, [
  [80, 30, 80, 14, PINK], [70, 44, 100, 16, PINK], [64, 60, 112, 14, PINK],
  [72, 76, 96, 14, BROWN_DARK], [76, 90, 88, 14, BROWN_DARK], [80, 104, 80, 14, BROWN_DARK], [84, 118, 72, 12, BROWN_DARK],
  [116, 18, 8, 12, [200, 30, 60]]
]);
const person = (x, shirt) => [[x + 14, 40, 28, 28, [224, 172, 135]], [x, 72, 56, 70, shirt]];
const teamPhoto = png(320, 180, [190, 220, 240], [
  [0, 140, 320, 40, [120, 170, 90]],
  ...person(40, [236, 112, 160]), ...person(132, [80, 120, 200]), ...person(224, [250, 190, 60])
]);
const bakeHtml = [
  '<!DOCTYPE html>',
  '<html lang="en">',
  '<head>',
  '  <meta charset="utf-8">',
  '  <title>Year 9 Bake Sale</title>',
  '  <link rel="stylesheet" href="css/style.css">',
  '</head>',
  '<body>',
  '  <header>',
  '    <img src="file:///C:/Users/sam/Desktop/bake-sale/images/logo.png" alt="Bake sale logo" class="logo">',
  '    <h1>Year 9 Bake Sale</h1>',
  '    <p>Friday lunchtime, outside the library. All money raised goes to the Year 9 formal.</p>',
  '  </header>',
  '  <main>',
  '    <section class="card">',
  '      <h2>Price calculator</h2>',
  '      <label for="cupcakes">Cupcakes ($2.50 each)</label>',
  '      <input type="number" id="cupcakes" min="0" value="0">',
  '      <label for="cookies">Cookies ($1.50 each)</label>',
  '      <input type="number" id="cookies" min="0" value="0">',
  '      <p class="total">Total: <span id="total">calculator not working yet</span></p>',
  '    </section>',
  '    <section class="card">',
  '      <h2>Meet the bakers</h2>',
  '      <img src="images/team-photo.png" alt="Photo of the Year 9 baking team" class="team">',
  '    </section>',
  '  </main>',
  '  <script src="js/prices.js"></script>',
  '</body>',
  '</html>'
];
const bakeCss = [
  'body { margin: 0; font-family: Arial, sans-serif; background: #fff4de; color: #4a2c17; }',
  'header { background: #ec70a0; color: white; text-align: center; padding: 24px; }',
  '.logo { width: 120px; background: white; border-radius: 12px; }',
  'main { max-width: 640px; margin: 24px auto; padding: 0 16px; display: grid; gap: 16px; }',
  '.card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); }',
  'label, input { display: block; margin-top: 8px; }',
  '.total { font-size: 1.4em; font-weight: bold; }',
  '.team { width: 100%; border-radius: 8px; }'
];
const bakeJs = [
  '// Works out the total cost as the numbers change.',
  'const cupcakes = document.getElementById("cupcakes");',
  'const cookies = document.getElementById("cookies");',
  'const total = document.getElementById("total");',
  '',
  'function update() {',
  '  const cost = cupcakes.value * 2.5 + cookies.value * 1.5;',
  '  total.textContent = "$" + cost.toFixed(2);',
  '}',
  '',
  'cupcakes.addEventListener("input", update);',
  'cookies.addEventListener("input", update);',
  'update();'
];
const bakeFiles = {
  'bake-sale/index.html': { data: text(bakeHtml), date: '2026-07-20' },
  'bake-sale/style.css': { data: text(bakeCss), date: '2026-07-18' },
  'bake-sale/js/prices.js.txt': { data: text(bakeJs), date: '2026-07-19' },
  'bake-sale/images/logo.png': { data: bakeLogo, date: '2026-07-15' }
};
const zipFlat = (files) => zip(Object.keys(files).map((name) => ({ name, data: files[name].data, date: files[name].date })));
const compressZip = zipFlat(compressFiles);
const bakeZip = zipFlat(bakeFiles);
const zipLesson = path.join(ROOT, 'exercise-files', 'zip-and-hand-in');
fs.mkdirSync(zipLesson, { recursive: true });
fs.writeFileSync(path.join(zipLesson, 'compress-test.zip'), compressZip);
fs.writeFileSync(path.join(zipLesson, 'bake-sale.zip'), bakeZip);
fs.writeFileSync(path.join(zipLesson, 'team-photo.png'), teamPhoto);

const served = {
  'test-file.txt': { mime: 'text/plain', data: testFile },
  'photo.jpg': { mime: 'image/jpeg', data: photo },
  'sams-files.zip': { mime: 'application/zip', data: samsZip },
  'practice-files.zip': { mime: 'application/zip', data: practiceZip },
  'garden-project.zip': { mime: 'application/zip', data: gardenZip },
  'python-starter.zip': { mime: 'application/zip', data: pythonZip },
  'compress-test.zip': { mime: 'application/zip', data: compressZip },
  'bake-sale.zip': { mime: 'application/zip', data: bakeZip },
  'team-photo.png': { mime: 'image/png', data: teamPhoto }
};

const entries = Object.keys(served).map((name) => `  '${name}': { mime: '${served[name].mime}', data: '${served[name].data.toString('base64')}' }`);
const source = `/**
 * Files students download during the lessons, stored as base64 text.
 * Generated by dev/build-exercise-files.js. Change that script rather than this file.
 */
var EXERCISE_FILES = {
${entries.join(',\n')}
};
`;
fs.writeFileSync(path.join(ROOT, 'src', 'ExerciseFiles.gs'), source);
console.log(`Built ${Object.keys(samsFiles).length} files for Sam, and ${Math.round(source.length / 1024)} KB of exercise files.`);
