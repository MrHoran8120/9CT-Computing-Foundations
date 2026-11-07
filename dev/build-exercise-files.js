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

const served = {
  'test-file.txt': { mime: 'text/plain', data: testFile },
  'photo.jpg': { mime: 'image/jpeg', data: photo },
  'sams-files.zip': { mime: 'application/zip', data: samsZip }
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
