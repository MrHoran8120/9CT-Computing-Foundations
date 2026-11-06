/**
 * Course structure. This is the only list of lessons, sections and tasks.
 *
 * Task IDs are permanent: saved progress depends on them. Change a label freely,
 * but never change or reuse an ID. To remove a task, delete it and leave its ID retired.
 */
var COURSE = [
  {
    id: 'L1',
    title: 'Computer fundamentals',
    tab: 'Files',
    sections: [
      { title: 'Apps and files', tasks: [
        { id: 'L1-APPS-01', label: 'I can tell the difference between an app and a file.' }
      ] },
      { title: 'Find your way around', tasks: [
        { id: 'L1-NAV-01', label: 'I opened Downloads and Documents.' },
        { id: 'L1-NAV-02', label: 'I downloaded the test file and found it.' }
      ] },
      { title: 'Folders and paths', tasks: [
        { id: 'L1-PATH-01', label: 'I wrote the full path of the test file.' },
        { id: 'L1-PATH-02', label: 'I chose the correct path from the three options.' }
      ] },
      { title: 'Create, copy, move, rename, delete', tasks: [
        { id: 'L1-MANAGE-01', label: 'I made Documents › Year 9 › Science.' },
        { id: 'L1-MANAGE-02', label: 'I copied a file, and the original is still there.' },
        { id: 'L1-MANAGE-03', label: 'I moved a file, and it is gone from where it was.' },
        { id: 'L1-MANAGE-04', label: 'I renamed a file, deleted it, then got it back.' }
      ] },
      { title: 'File extensions', tasks: [
        { id: 'L1-EXT-01', label: 'I turned on visible file extensions.' },
        { id: 'L1-EXT-02', label: 'I matched each extension to what it is.' }
      ] },
      { title: 'Local and cloud', tasks: [
        { id: 'L1-STORAGE-01', label: 'I can say which of my files are local and which are in the cloud.' }
      ] },
      { title: 'Rescue challenge', tasks: [
        { id: 'L1-RESCUE-01', label: 'I extracted Sam\'s files and built a folder structure.' },
        { id: 'L1-RESCUE-02', label: 'I moved and renamed every file.' },
        { id: 'L1-RESCUE-03', label: 'I explained my structure and showed my teacher.' }
      ] }
    ]
  },
  {
    id: 'L2',
    title: 'ZIP files and submission',
    tab: 'ZIP and hand-in',
    sections: [
      { title: 'What a ZIP is', tasks: [
        { id: 'L2-ZIP-01', label: 'I predicted which folder will shrink more.' }
      ] },
      { title: 'Make a ZIP', tasks: [
        { id: 'L2-MAKE-01', label: 'I zipped both folders.' },
        { id: 'L2-MAKE-02', label: 'I compared the sizes and checked my prediction.' }
      ] },
      { title: 'Extract properly', tasks: [
        { id: 'L2-EXTRACT-01', label: 'I extracted the bake sale ZIP and can see the images folder.' },
        { id: 'L2-EXTRACT-02', label: 'The project folder is now in Documents › Year 9.' }
      ] },
      { title: 'Why paths break', tasks: [
        { id: 'L2-PATH-01', label: 'I answered "Will the logo load?" for all three projects.' },
        { id: 'L2-PATH-02', label: 'I sorted paths into relative and absolute.' }
      ] },
      { title: 'Repair the bake sale site', tasks: [
        { id: 'L2-REPAIR-01', label: 'The logo now shows.' },
        { id: 'L2-REPAIR-02', label: 'The page now has its colours and layout.' },
        { id: 'L2-REPAIR-03', label: 'The price calculator now works.' },
        { id: 'L2-REPAIR-04', label: 'The team photo now shows.' }
      ] },
      { title: 'Test it somewhere else', tasks: [
        { id: 'L2-VERIFY-01', label: 'I zipped the repaired site.' },
        { id: 'L2-VERIFY-02', label: 'I extracted it somewhere new, and it still works.' }
      ] },
      { title: 'Hand it in', tasks: [
        { id: 'L2-SUBMIT-01', label: 'I checked my ZIP for the common mistakes.' },
        { id: 'L2-SUBMIT-02', label: 'I uploaded my ZIP to the Google Classroom task.' }
      ] }
    ]
  },
  {
    id: 'L3',
    title: 'AI and assessment',
    tab: 'AI',
    sections: [
      { title: 'Why this matters', tasks: [
        { id: 'L3-WHY-01', label: 'I took part in the class poll.' }
      ] },
      { title: 'The three levels', tasks: [
        { id: 'L3-LEVEL-01', label: 'I matched each action to the lowest level that allows it.' }
      ] },
      { title: 'Scenarios', tasks: [
        { id: 'L3-SCEN-01', label: 'I worked through all eight scenarios.' }
      ] },
      { title: 'Explain your own work', tasks: [
        { id: 'L3-EXPLAIN-01', label: 'I explained a short piece of HTML to my partner.' }
      ] },
      { title: 'Why we acknowledge AI', tasks: [
        { id: 'L3-ACK-01', label: 'I can say why AI use is acknowledged.' }
      ] },
      { title: 'Check AI\'s answers', tasks: [
        { id: 'L3-CHECK-01', label: 'I found the mistakes in the sample AI answer.' }
      ] },
      { title: 'Protect your information', tasks: [
        { id: 'L3-PRIVACY-01', label: 'I sorted examples into safe and not safe to paste.' }
      ] },
      { title: 'Quiz and agreement', tasks: [
        { id: 'L3-QUIZ-01', label: 'I completed the quiz.' },
        { id: 'L3-AGREE-01', label: 'I read and agree to my responsibilities.' }
      ] }
    ]
  }
];

/** Returns every valid task ID, used to reject anything else sent from a browser. */
function allTaskIds_() {
  var ids = [];
  COURSE.forEach(function (lesson) {
    lesson.sections.forEach(function (section) {
      section.tasks.forEach(function (task) { ids.push(task.id); });
    });
  });
  return ids;
}
