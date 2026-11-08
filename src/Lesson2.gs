/**
 * What students read and do in "ZIP files and submission" (lesson ID L2, shown fourth). Each list
 * belongs to the section whose first task has that ID. Wording here can change freely.
 *
 * The key idea: a project isn't ready to hand in until it has been extracted somewhere else and
 * tested there. Students repair the bake sale site in VS Code, which they set up in Lesson 3.
 *
 * Text marks: **bold**, `file or code`, [[key on the keyboard]]. Anything can be { win, mac }.
 */
function lesson2Content_() {
  var EXTRACT = function (zipName) {
    return { win: 'Go to **Downloads**, right-click `' + zipName + '`, click **Extract All**, then click **Extract**.', mac: 'Go to **Downloads** and double-click `' + zipName + '`.' };
  };
  var COMPRESS = function (folder) {
    return { win: 'Right-click the `' + folder + '` folder, then click **Compress to ZIP file**. On older Windows, point to **Send to**, then click **Compressed (zipped) folder**.', mac: 'Right-click the `' + folder + '` folder, then click **Compress "' + folder + '"**.' };
  };

  return {
    'L2-ZIP-01': [
      { type: 'objective', text: 'By the end of this section, you can say what a ZIP file is and why we use one.' },
      { type: 'concept', text: 'A **ZIP file** packs a whole folder, with everything inside it, into one file. That makes it easy to send, upload or hand in. A ZIP usually **compresses** the files too, so it takes up less space. Your computer can open a ZIP without any extra app.' },
      { type: 'concept', text: 'Some files shrink a lot when zipped, and some barely shrink. Text has lots of repeated patterns, which ZIP can store in a shorter way. Photos are already compressed, so there\'s little left to squeeze.' },
      { type: 'choice', id: 'zip-predict', question: 'Predict: you zip a folder of text notes and a folder of photos. Which will shrink more?', options: ['The text notes', 'The photos', 'Both will shrink the same amount'], answer: 0, explain: 'Text is full of repeated letters and words, so it squeezes down a lot. You\'ll test this in the next section.' },
      { type: 'tick', task: 'L2-ZIP-01' }
    ],

    'L2-MAKE-01': [
      { type: 'objective', text: 'By the end of this section, you can make a ZIP file and check how much it saved.' },
      { type: 'steps', title: 'Get the test folders', steps: [
        'Download the test folders using the button below.',
        EXTRACT('compress-test.zip'),
        'Inside you\'ll find two folders: `Notes`, full of text, and `Photos`.'
      ] },
      { type: 'download', file: 'compress-test.zip', label: 'Download compress-test.zip' },
      { type: 'steps', title: 'Zip both folders', steps: [
        COMPRESS('Notes'),
        'Do the same for the `Photos` folder.',
        'You now have `Notes.zip` and `Photos.zip` next to the folders.'
      ] },
      { type: 'tick', task: 'L2-MAKE-01' },
      { type: 'steps', title: 'Compare the sizes', steps: [
        { win: 'Right-click the `Notes` folder and click **Properties**. Write down its **Size**.', mac: 'Click the `Notes` folder once and press [[Command]] + [[I]]. Write down its size.' },
        { win: 'Do the same for `Notes.zip`, `Photos` and `Photos.zip`.', mac: 'Do the same for `Notes.zip`, `Photos` and `Photos.zip`.' },
        'Which shrank more? Was your prediction right?'
      ] },
      { type: 'tip', text: 'Sizes are in KB. About 1,000 KB make 1 MB. The Notes folder should shrink to about a tenth of its size, while the photos shrink much less.' },
      { type: 'tick', task: 'L2-MAKE-02' }
    ],

    'L2-EXTRACT-01': [
      { type: 'objective', text: 'By the end of this section, you can extract a ZIP into the right place, on Windows or a Mac.' },
      { type: 'concept', text: '**Extracting** unpacks a ZIP into an ordinary folder. Windows and Macs do this differently, so it\'s easy to lose track of where the files went.' },
      { type: 'diagram', svg: { win: extractDiagram_('win'), mac: extractDiagram_('mac') }, alt: { win: 'On Windows, Extract All asks where to put the files, such as Downloads\\bake-sale, then makes the bake-sale folder there.', mac: 'On a Mac, double-clicking bake-sale.zip in Downloads makes a bake-sale folder right next to it in Downloads, without asking.' } },
      { type: 'tip', text: { win: 'Double-clicking a ZIP on Windows opens it like a folder, but you\'re only looking inside. Files you change there aren\'t saved back. Always use **Extract All** first.', mac: 'If you double-click the same ZIP twice, your Mac makes a second folder, such as `bake-sale 2`. Check which one you\'re working in.' } },
      { type: 'steps', title: 'Extract the bake sale site', steps: [
        'Download the bake sale site using the button below. Sam made it, but it doesn\'t quite work yet.',
        EXTRACT('bake-sale.zip'),
        'Open the new `bake-sale` folder and check that you can see `index.html` and an `images` folder.'
      ] },
      { type: 'download', file: 'bake-sale.zip', label: 'Download bake-sale.zip' },
      { type: 'tick', task: 'L2-EXTRACT-01' },
      { type: 'steps', title: 'Put it where it belongs', steps: [
        'Move the whole `bake-sale` folder into **Documents › Year 9**.',
        'You can delete `bake-sale.zip` from **Downloads** now. You have the real folder.'
      ] },
      { type: 'tick', task: 'L2-EXTRACT-02' }
    ],

    'L2-PATH-01': [
      { type: 'objective', text: 'By the end of this section, you can tell whether a website can find its files, and why.' },
      { type: 'concept', text: 'A web page doesn\'t contain its pictures. It contains a **path** that says where to find each one, such as `images/logo.png`. If the path is wrong, the picture doesn\'t show.' },
      { type: 'diagram', svg: siteDiagram_(), alt: 'The bake-sale folder holds index.html and three folders: css with style.css, js with prices.js, and images with logo.png. index.html finds them with the paths css/style.css, js/prices.js and images/logo.png.' },
      { type: 'concept', text: 'A **relative path**, such as `images/logo.png`, starts from the page\'s own folder. It keeps working wherever the project goes. An **absolute path**, such as `C:/Users/sam/Desktop/logo.png`, points to one exact place on one computer. On anyone else\'s computer it breaks.' },
      { type: 'choice', id: 'logo-a', question: 'Project A: `index.html` uses `images/logo.png`, and the project has an `images` folder with `logo.png` inside. You zip it and open it on another computer. Will the logo load?', options: ['Yes', 'No'], answer: 0, explain: 'The path starts from the page\'s own folder, and the folders came along in the ZIP.' },
      { type: 'choice', id: 'logo-b', question: 'Project B: `index.html` uses `file:///C:/Users/mia/Desktop/site/logo.png`. Mia hands it in. Will the logo load on her teacher\'s computer?', options: ['Yes', 'No'], answer: 1, explain: 'That\'s an absolute path. It points to Mia\'s own Desktop, which doesn\'t exist on her teacher\'s computer.' },
      { type: 'choice', id: 'logo-c', question: 'Project C: `index.html` uses `logo.png`, but the logo is inside the `images` folder. Will the logo load?', options: ['Yes', 'No'], answer: 1, explain: 'The path says the logo is next to the page, but it\'s inside `images`. The path should be `images/logo.png`.' },
      { type: 'tick', task: 'L2-PATH-01' },
      { type: 'match', id: 'paths', prompt: 'Is each path relative or absolute?', choices: ['Relative', 'Absolute'], items: [
        { text: '`images/logo.png`', answer: 'Relative' },
        { text: '`C:/Users/ava/Documents/site/style.css`', answer: 'Absolute' },
        { text: '`css/style.css`', answer: 'Relative' },
        { text: '`/Users/ava/Desktop/photo.jpg`', answer: 'Absolute' },
        { text: '`js/prices.js`', answer: 'Relative' }
      ] },
      { type: 'tick', task: 'L2-PATH-02' }
    ],

    'L2-REPAIR-01': [
      { type: 'objective', text: 'Find and fix the four problems in Sam\'s bake sale site. This time, you work out how.' },
      { type: 'steps', title: 'See what\'s broken', steps: [
        'Open **Documents › Year 9 › bake-sale** and double-click `index.html`. It opens in your browser.',
        'Look for a missing logo, missing colours, a calculator that doesn\'t work, and a missing photo.',
        'Open the `bake-sale` folder in VS Code, using **File** › **Open Folder**, so you can see its files and edit `index.html`.'
      ] },
      { type: 'tip', text: 'After each fix, save in VS Code, then reload the page in your browser with [[F5]] on Windows, or [[Command]] + [[R]] on a Mac.' },
      { type: 'steps', title: 'Fix 1: the logo', steps: [
        'In `index.html`, find the line with `logo.png`. What kind of path is it?',
        'Change it to a relative path that works from the page\'s own folder.',
        'Save, reload the page, and check the logo shows.'
      ] },
      { type: 'tick', task: 'L2-REPAIR-01' },
      { type: 'steps', title: 'Fix 2: the colours and layout', steps: [
        'Find the line in `index.html` that loads the stylesheet. Where does it expect `style.css` to be?',
        'Look at where `style.css` actually is. Make them match, either by moving the file or by changing the path.',
        'Reload the page. It should turn pink and cream.'
      ] },
      { type: 'tick', task: 'L2-REPAIR-02' },
      { type: 'steps', title: 'Fix 3: the price calculator', steps: [
        'The page loads `js/prices.js`. Look closely at the file in the `js` folder. Check its full name, including the extension.',
        'Fix the file so its name matches the path. Lesson 1 showed you why the extension matters.',
        'Reload the page and type some numbers. The total should change.'
      ] },
      { type: 'tick', task: 'L2-REPAIR-03' },
      { type: 'steps', title: 'Fix 4: the team photo', steps: [
        'The page wants `images/team-photo.png`, but it isn\'t in the project. Sam forgot to include it.',
        'Download the photo using the button below.',
        'Put it where the page expects it to be, then reload the page.'
      ] },
      { type: 'download', file: 'team-photo.png', label: 'Download team-photo.png' },
      { type: 'tick', task: 'L2-REPAIR-04' }
    ],

    'L2-VERIFY-01': [
      { type: 'objective', text: 'By the end of this section, you know your project works on any computer, not just yours.' },
      { type: 'concept', text: '**A project isn\'t ready to hand in until you\'ve extracted it somewhere else and tested it there.** Your own copy might only work because of something on your computer, such as an absolute path or a file that didn\'t go into the ZIP.' },
      { type: 'steps', title: 'Zip the repaired site', steps: [
        'Close the page in your browser, and save everything in VS Code.',
        COMPRESS('bake-sale'),
        'You now have `bake-sale.zip` next to the folder.'
      ] },
      { type: 'tick', task: 'L2-VERIFY-01' },
      { type: 'steps', title: 'Test it somewhere else', steps: [
        'Move `bake-sale.zip` onto your **Desktop**.',
        { win: 'On the Desktop, right-click it, click **Extract All**, then **Extract**.', mac: 'On the Desktop, double-click it.' },
        'Open `index.html` from the new copy on the Desktop, not your original.',
        'Check all four fixes: the logo, the colours, the calculator and the team photo.',
        'If anything is broken, fix the original, zip it again, and test again.'
      ] },
      { type: 'tick', task: 'L2-VERIFY-02' },
      { type: 'tip', text: 'Once it works, delete the test copy on your Desktop, so you don\'t mix it up with your original.' }
    ],

    'L2-SUBMIT-01': [
      { type: 'objective', text: 'By the end of this section, you can hand in a project and check you handed in the right thing.' },
      { type: 'match', id: 'mistakes', prompt: 'These students handed in a website project. Did each one do it right?', choices: ['Right', 'Problem'], items: [
        { text: 'Zipped the whole project folder, then tested the ZIP on the Desktop', answer: 'Right' },
        { text: 'Uploaded only `index.html`', answer: 'Problem' },
        { text: 'Zipped an older copy from **Downloads**, not the finished one', answer: 'Problem' },
        { text: 'Edited the page, then zipped it before saving in VS Code', answer: 'Problem' },
        { text: 'Named the file `New folder.zip`', answer: 'Problem' },
        { text: 'Named the file `bake-sale-yourname.zip`', answer: 'Right' }
      ] },
      { type: 'steps', title: 'Check your own ZIP', steps: [
        'It came from the finished folder in **Documents › Year 9**.',
        'You tested it after extracting it somewhere else.',
        'Rename it so your teacher knows whose it is, such as `bake-sale-mia.zip`.'
      ] },
      { type: 'tick', task: 'L2-SUBMIT-01' },
      { type: 'steps', title: 'Hand it in', intro: 'Your teacher has set up a practice task in Google Classroom. It\'s practice only, so it isn\'t marked.', steps: [
        'Open Google Classroom and your class, then click **Classwork**.',
        'Open the practice task your teacher named.',
        'Click **Add or create**, then **File**, then upload your ZIP.',
        'Click **Hand in**, then **Hand in** again to confirm.',
        'Click your ZIP\'s name in the task to check you handed in the right file.'
      ] },
      { type: 'tick', task: 'L2-SUBMIT-02' }
    ],

    'L2-EXTRA-01': [
      { type: 'objective', text: 'Finished early? Add a second page to the bake sale site. This doesn\'t count towards your progress.' },
      { type: 'steps', title: 'Add a page', steps: [
        'In VS Code, make a new file in `bake-sale` called `about.html`.',
        'Copy the first 8 lines of `index.html` into it, so it uses the same stylesheet.',
        'Add a heading and a sentence about the bake sale, then close the `body` and `html` tags.',
        'In `index.html`, add a link to the new page, such as `<a href="about.html">About us</a>`.',
        'In `about.html`, add a link back to `index.html`.',
        'Zip the project, extract it on the Desktop, and check that both links work there.'
      ] },
      { type: 'tip', text: 'A link is a path too. `about.html` works because both pages are in the same folder.' }
    ]
  };
}
