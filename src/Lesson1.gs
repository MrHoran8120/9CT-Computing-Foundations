/**
 * What students read and do in Lesson 1. Each list belongs to the section whose first task has
 * that ID. Wording here can change freely.
 *
 * Text marks: **bold**, `file or code`, [[key on the keyboard]]. Anything can be { win, mac } when
 * the two computers differ. Everything else is shared, so there's one copy to keep up to date.
 * A block with only: 'win' or only: 'mac' appears on that computer alone.
 */
function lesson1Content_() {
  var BIN = { win: 'Recycle Bin', mac: 'Bin' };
  var OPEN_FILES = {
    win: 'Press [[Windows]] + [[E]] to open **File Explorer**.',
    mac: 'Open **Finder** in one of two ways. Click its icon in the **Dock**, which looks like a blue face. Or press [[Command]] + [[Space]] to open **Spotlight**, type `Finder`, then press [[Return]].'
  };

  return {
    'L1-APPS-01': [
      { type: 'objective', text: 'By the end of this section, you can tell an app from a file, and say which app opens which file.' },
      { type: 'concept', text: 'An **app** is a tool that does a job, such as Word or Chrome. A **file** is something you make or open with that tool, such as an essay or a photo. You keep using the same app, but you can have thousands of files.' },
      { type: 'diagram', svg: appFileDiagram_(), alt: 'essay.docx opens in Word, and beach.jpg opens in Photos or Preview. Files are on the left and apps are on the right.' },
      { type: 'tip', text: 'Your computer may hide the end of a file\'s name, such as `.docx`. You will change that in the next section.' },
      { type: 'match', id: 'apps', prompt: 'Is each of these an app or a file?', choices: ['App', 'File'], items: [
        { text: 'Google Chrome', answer: 'App' },
        { text: '`history-essay.docx`', answer: 'File' },
        { text: 'Microsoft Word', answer: 'App' },
        { text: '`beach.jpg`', answer: 'File' },
        { text: 'Calculator', answer: 'App' },
        { text: '`timetable.pdf`', answer: 'File' },
        { text: 'Spotify', answer: 'App' },
        { text: '`favourite-song.mp3`', answer: 'File' }
      ] }
    ],

    'L1-NAV-01': [
      { type: 'objective', text: { win: 'By the end of this section, you can use File Explorer to find anything you download.', mac: 'By the end of this section, you can use Finder to find anything you download.' } },
      { type: 'concept', text: { win: '**File Explorer** is the Windows app for looking through your files. You will use it in every lesson of this course.', mac: '**Finder** is the Mac app for looking through your files. You will use it in every lesson of this course.' } },
      { type: 'diagram', svg: { win: windowDiagram_('win'), mac: windowDiagram_('mac') }, alt: { win: 'A drawing of File Explorer. 1: the left pane lists Desktop, Downloads and Documents. 2: the bar at the top shows where you are. 3: the main area shows what is in the folder.', mac: 'A drawing of Finder. 1: the sidebar lists Desktop, Documents and Downloads. 2: the top of the window shows where you are. 3: the main area shows what is in the folder.' }, caption: { win: '**1** The left pane takes you to common places. **2** This bar shows where you are. **3** This area shows what is in the folder.', mac: '**1** The sidebar takes you to common places. **2** This shows where you are. **3** This area shows what is in the folder.' } },
      { type: 'steps', title: 'Find your way around', steps: [
        OPEN_FILES,
        { win: 'Click **Downloads** in the left pane. This is where your browser normally saves files.', mac: 'Click **Downloads** in the sidebar. This is where your browser normally saves files.' },
        { win: 'Click **Documents** in the left pane.', mac: 'Click **Documents** in the sidebar.' }
      ] },
      { type: 'tip', text: { win: 'You can also open File Explorer by clicking the folder icon on the taskbar, but the shortcut works from anywhere.', mac: 'You can open any app from the Dock or with Spotlight. The Dock is handy for apps you use often. Spotlight also finds apps that aren\'t in the Dock: press [[Command]] + [[Space]], type the first few letters of the name, then press [[Return]].' } },
      { type: 'steps', title: 'Show the full names of your files', intro: 'Computers often hide the end of a file\'s name. Turn this on now, so that what you see matches this course.', steps: [
        { win: 'In File Explorer, click **View** at the top.', mac: 'Click **Finder** in the menu bar, then **Settings**.' },
        { win: 'Point to **Show**.', mac: 'Click **Advanced**.' },
        { win: 'Click **File name extensions**, so that it has a tick.', mac: 'Tick **Show all filename extensions**, then close the window.' }
      ] },
      { type: 'tip', text: { win: 'On older versions of Windows, the top of File Explorer looks different. Use the picture below instead.', mac: 'On older versions of macOS, the menu item is called **Preferences** instead of Settings.' } },
      { type: 'diagram', only: 'win', svg: olderWindowsExtensionsDiagram_(), alt: 'A drawing of File Explorer on older Windows. 1: click the View tab. 2: in the Show/hide group, tick File name extensions.', caption: 'Older Windows only. **1** Click the **View** tab. **2** Tick **File name extensions**.' },
      { type: 'steps', title: 'Download a file and find it', steps: [
        'Click the button below.',
        'Go back to **Downloads** and look for `test-file.txt`. Newest files are often at the top.',
        'Double-click the file to open it, then read the message and close it.'
      ] },
      { type: 'download', file: 'test-file.txt', label: 'Download test-file.txt' },
      { type: 'tip', text: 'Can\'t see it? Your browser may have asked where to save it, or added a number to the name, such as `test-file (1).txt`. That happens when you download a file twice.' }
    ],

    'L1-PATH-01': [
      { type: 'objective', text: 'By the end of this section, you can write down exactly where a file lives.' },
      { type: 'concept', text: 'Folders sit inside other folders. A **path** is a file\'s full address, like an address goes from suburb to street to house. It lists each folder you pass through to reach the file.' },
      { type: 'tree', prompt: 'Click any folder or file to see its path.', start: { win: 'C:\\Users\\you\\', mac: '/Users/you/' }, divider: { win: '\\', mac: '/' }, selected: 'Documents/Year 9/Science/prac-report.pdf', nodes: [
        { name: 'Documents', children: [
          { name: 'Year 9', children: [
            { name: 'Science', children: [{ name: 'prac-report.pdf' }] },
            { name: 'English', children: [{ name: 'essay-draft.docx' }] }
          ] }
        ] },
        { name: 'Downloads', children: [{ name: 'test-file.txt' }] }
      ] },
      { type: 'diagram', svg: { win: pathDiagram_('win'), mac: pathDiagram_('mac') }, alt: { win: 'The path C:\\Users\\you\\Documents\\Year 9\\photo.jpg split into parts. Each backslash means go inside the next folder, and the last part is the file.', mac: 'The path /Users/you/Documents/Year 9/photo.jpg split into parts. Each slash means go inside the next folder, and the last part is the file.' } },
      { type: 'steps', title: 'Write the path of your test file', steps: [
        { win: 'In File Explorer, go to **Downloads** and right-click `test-file.txt`.', mac: 'In Finder, click **View** in the menu bar, then **Show Path Bar**. Then go to **Downloads** and click `test-file.txt`.' },
        { win: 'Click **Copy as path**.', mac: 'Read the path bar at the bottom of the window. It shows each folder in order.' },
        { win: 'Open Notepad and paste with [[Ctrl]] + [[V]] to see the full path.', mac: 'Starting with `/Users/`, write the full path using `/` between each folder.' },
        'Write the path in your book, or anywhere your teacher asks.'
      ] },
      { type: 'tip', text: { win: 'If your path includes `OneDrive`, your Documents or Downloads folder is being saved to the cloud. That\'s normal, and you will learn about it soon. Older Windows versions may need [[Shift]] held while you right-click.', mac: 'Your own name appears in the path instead of `you`. That\'s the name of your account on this Mac.' } },
      { type: 'choice', id: 'path', question: 'Sam saved `poem.docx` inside a folder called English, inside Documents. Which path is correct?', options: [
        { win: 'C:\\Users\\sam\\English\\Documents\\poem.docx', mac: '/Users/sam/English/Documents/poem.docx' },
        { win: 'C:\\Users\\sam\\Documents\\English\\poem.docx', mac: '/Users/sam/Documents/English/poem.docx' },
        { win: 'C:\\Users\\sam\\Documents\\poem.docx\\English', mac: '/Users/sam/Documents/poem.docx/English' }
      ], answer: 1, explain: 'Paths go from the outside in: Documents, then English, then the file. A file always comes last, because nothing can go inside it.' }
    ],

    'L1-MANAGE-01': [
      { type: 'objective', text: 'By the end of this section, you can organise files without opening them.' },
      { type: 'concept', text: '**Copy** makes a second file and leaves the original where it was. **Move** changes where a file lives, so there is still only one. Knowing which one you did tells you where your work is.' },
      { type: 'diagram', svg: copyMoveDiagram_(), alt: 'Copying a file from Downloads to Science leaves one file in each folder. Moving it leaves a file in Science only.' },
      { type: 'steps', title: 'Make your Year 9 folders', steps: [
        { win: 'In File Explorer, click **Documents** in the left pane.', mac: 'In Finder, click **Documents** in the sidebar.' },
        { win: 'Click **New**, then **Folder**.', mac: 'Click **File** in the menu bar, then **New Folder**.' },
        { win: 'Type `Year 9` and press [[Enter]].', mac: 'Type `Year 9` and press [[Return]].' },
        'Double-click **Year 9** to go inside it.',
        { win: 'Make another folder in the same way, called `Science`.', mac: 'Make another folder in the same way, called `Science`.' }
      ] },
      { type: 'keys', title: 'Keyboard shortcuts', rows: [
        ['Copy', { win: '[[Ctrl]] + [[C]], then go to the new folder and press [[Ctrl]] + [[V]]', mac: '[[Command]] + [[C]], then go to the new folder and press [[Command]] + [[V]]' }],
        ['Move', { win: '[[Ctrl]] + [[X]], then go to the new folder and press [[Ctrl]] + [[V]]', mac: '[[Command]] + [[C]], then go to the new folder and press [[Option]] + [[Command]] + [[V]]' }],
        ['Rename', { win: 'Click the file once, then press [[F2]]', mac: 'Click the file once, then press [[Return]]' }],
        ['Delete', { win: 'Click the file once, then press [[Delete]]', mac: 'Click the file once, then press [[Command]] + [[Delete]]' }]
      ] },
      { type: 'steps', title: 'Copy, then move', steps: [
        'Copy `test-file.txt` from **Downloads** into **Science**.',
        'Check both folders. The file should be in both.',
        'Download `photo.jpg` using the button below.',
        'Move `photo.jpg` from **Downloads** into **Year 9**.',
        'Check both folders. The photo should only be in **Year 9**.'
      ] },
      { type: 'download', file: 'photo.jpg', label: 'Download photo.jpg' },
      { type: 'steps', title: 'Rename, delete and get it back', steps: [
        'In **Year 9**, rename `photo.jpg` to `sunset.jpg`. Keep the `.jpg` at the end.',
        'Delete `sunset.jpg`.',
        { win: 'Open the **Recycle Bin** from your Desktop.', mac: 'Click the **Bin** at the end of the Dock.' },
        { win: 'Right-click `sunset.jpg` and click **Restore**.', mac: 'Right-click `sunset.jpg` and click **Put Back**.' },
        'Check that it\'s back in **Year 9**.'
      ] },
      { type: 'tip', text: { win: 'On older versions of Windows, click the **Home** tab, then **New folder**.', mac: 'Deleted files stay in the Bin until it is emptied, so check it before you panic.' } }
    ],

    'L1-EXT-02': [
      { type: 'objective', text: 'By the end of this section, you can tell a file\'s type from its name.' },
      { type: 'concept', text: 'The **extension** is the ending of a file\'s name. It tells the computer what type of file it is and which app to use. Changing the extension doesn\'t convert a file. Renaming `notes.docx` to `notes.pdf` just gives you a file that won\'t open properly.' },
      { type: 'diagram', svg: extensionDiagram_(), alt: 'The file name prac-report.docx has two parts: prac-report is the name you choose, and .docx is the extension.' },
      { type: 'tip', text: 'These are the endings you turned on in section 2. Look at `sunset.jpg` in your **Year 9** folder to see one.' },
      { type: 'match', id: 'extensions', prompt: 'Match each extension to what it is.', choices: ['Word document', 'PDF document', 'Photo', 'Music', 'Web page', 'Compressed folder'], items: [
        { text: '`.docx`', answer: 'Word document' },
        { text: '`.pdf`', answer: 'PDF document' },
        { text: '`.jpg`', answer: 'Photo' },
        { text: '`.mp3`', answer: 'Music' },
        { text: '`.html`', answer: 'Web page' },
        { text: '`.zip`', answer: 'Compressed folder' }
      ] }
    ],

    'L1-STORAGE-01': [
      { type: 'objective', text: 'By the end of this section, you can say where your work is stored and what would happen if your laptop stopped working.' },
      { type: 'concept', text: '**Local** means the file is on this computer. **Cloud** means it\'s kept on a company\'s servers, so you can reach it from another device. Downloads and the Desktop are usually local, unless you have set them up to sync.' },
      { type: 'diagram', svg: storageDiagram_(), alt: 'Local files are on this laptop only, such as Downloads and Desktop. Cloud files are on a company\'s servers, such as Google Drive, OneDrive and iCloud. The two can sync over the internet.' },
      { type: 'match', id: 'storage', prompt: 'Your laptop stops working tonight and can\'t be fixed. Would you still have each file?', choices: ['Still have it', 'Lost it'], items: [
        { text: 'An essay saved only on your Desktop', answer: 'Lost it' },
        { text: 'A science report saved in Google Drive', answer: 'Still have it' },
        { text: 'A photo you only downloaded to Downloads', answer: 'Lost it' }
      ] },
      { type: 'steps', title: 'Check your own files', steps: [
        'Think of two files you have made for school this year.',
        'Find out where each one is stored.',
        'Be ready to tell your teacher which is local and which is in the cloud.'
      ] }
    ],

    'L1-RESCUE-01': [
      { type: 'objective', text: 'Use what you\'ve learnt to rescue Sam\'s files. This is the main task for today.' },
      { type: 'concept', text: 'Sam has an assignment due tomorrow, and 15 files with names such as `Untitled.docx` and `IMG_2041.jpg`. Sam can\'t find anything. Your job is to organise them so that anyone could find any file in a few seconds.' },
      { type: 'steps', title: 'Get Sam\'s files', steps: [
        'Download Sam\'s files using the button below.',
        { win: 'Go to **Downloads**, right-click `sams-files.zip`, then click **Extract All**.', mac: 'Go to **Downloads** and double-click `sams-files.zip`.' },
        { win: 'Click **Extract**. A new window should open with a folder called `Sams files`.', mac: 'A new folder should appear with the name `Sams files`.' },
        'Move the `Sams files` folder into **Documents › Year 9**.',
        'Open the folder and check that you can see all 15 files. ZIP files are explained next lesson.'
      ] },
      { type: 'download', file: 'sams-files.zip', label: 'Download sams-files.zip' },
      { type: 'steps', title: 'Rescue them', steps: [
        'Open files to see what they are. The names won\'t always help.',
        'Make folders inside `Sams files` that make sense to you. You might use school subjects, plus somewhere for anything personal.',
        'Move every file into a folder. No loose files should be left.',
        'Rename every file so the name says what it is, such as `science-prac-report.docx`.',
        'Keep each file\'s extension when you rename it.',
        'Decide what to do with the two versions of the English assignment, and be ready to explain why.'
      ] },
      { type: 'tip', text: 'A good file name is short, says what the file is, and would still make sense to you next year.' },
      { type: 'steps', title: 'Explain it', steps: [
        'Write two sentences explaining how you organised the files, and why.',
        'Show your teacher your folders and read them your two sentences.'
      ] }
    ],

    'L1-EXTRA-01': [
      { type: 'objective', text: 'Finished early? Try these. They don\'t count towards your progress.' },
      { type: 'choice', id: 'puzzle1', question: { win: 'What is in the folder `Science`, in this path? `C:\\Users\\mia\\Documents\\Year 9\\Science\\Volcanoes\\map.png`', mac: 'What is in the folder `Science`, in this path? `/Users/mia/Documents/Year 9/Science/Volcanoes/map.png`' }, options: ['`map.png`', 'A folder called `Volcanoes`', 'A folder called `Year 9`'], answer: 1, explain: 'The next part of the path is what sits directly inside a folder. `map.png` is inside Volcanoes.' },
      { type: 'choice', id: 'puzzle2', question: { win: 'You move `map.png` up into Science. What is its new path?', mac: 'You move `map.png` up into Science. What is its new path?' }, options: [
        { win: 'C:\\Users\\mia\\Documents\\Year 9\\Science\\map.png', mac: '/Users/mia/Documents/Year 9/Science/map.png' },
        { win: 'C:\\Users\\mia\\Science\\map.png', mac: '/Users/mia/Science/map.png' },
        { win: 'C:\\Users\\mia\\Documents\\Science\\Volcanoes\\map.png', mac: '/Users/mia/Documents/Science/Volcanoes/map.png' }
      ], answer: 0, explain: 'Only the last folder changes. Everything Science sits inside stays the same.' },
      { type: 'choice', id: 'puzzle3', question: 'Two files have the same name, `notes.txt`. How can both be on one computer?', options: ['They can\'t be', 'They are in different folders, so they have different paths', 'The computer renames one of them each night'], answer: 1, explain: 'Each path can only point to one file. Two files can share a name as long as they are in different folders.' }
    ],

    'L1-EXTRA-02': [
      { type: 'objective', text: 'Finished early? See for yourself why changing an extension doesn\'t change a file. This doesn\'t count towards your progress.' },
      { type: 'steps', title: 'Break it', steps: [
        'Open your **Science** folder and find `test-file.txt`.',
        { win: 'Click the file once, press [[Ctrl]] + [[C]], then press [[Ctrl]] + [[V]]. This makes a copy in the same folder.', mac: 'Click the file once, then click **File** in the menu bar, then **Duplicate**. This makes a copy in the same folder.' },
        { win: 'Rename the copy to `broken.jpg`. Windows warns you that the file might stop working. Click **Yes**.', mac: 'Rename the copy to `broken.jpg`. Your Mac asks if you are sure. Click **Use .jpg**.' },
        'Double-click `broken.jpg`. What happens?'
      ] },
      { type: 'steps', title: 'Fix it', steps: [
        { win: 'Rename the file to `broken.txt`, and click **Yes** at the warning.', mac: 'Rename the file to `broken.txt`, and click **Use .txt** when asked.' },
        'Double-click it again. Your message should be back.'
      ] },
      { type: 'choice', id: 'broken1', question: 'Why couldn\'t `broken.jpg` open as a photo?', options: [
        'Renaming the file deleted what was inside it',
        'The name said photo, but what was inside was still text',
        'The file was too small to be a photo'
      ], answer: 1, explain: 'The extension only tells the computer which app to try. Renaming it left what was inside the file exactly the same, which is why you could fix it.' },
      { type: 'choice', id: 'broken2', question: 'Your teacher wants a PDF, but you have `essay.docx`. What should you do?', options: [
        'Rename it to `essay.pdf`',
        'Open it in Word, then use **Save As** or **Export** to make a PDF',
        'Put it in a folder called PDF'
      ], answer: 1, explain: 'Save As and Export really do convert the file. Renaming it only gives you a file that won\'t open properly.' }
    ],

    'L1-EXTRA-03': [
      { type: 'objective', text: 'Finished early? Make Sam\'s file names follow one clear rule. This doesn\'t count towards your progress.' },
      { type: 'concept', text: 'A **naming rule** tells you what to call any file before you save it. For example: use lowercase, put hyphens between words, and start with the subject, such as `history-federation-notes.txt`.' },
      { type: 'steps', title: 'Make your rule', steps: [
        'Write your naming rule in one sentence. It must work for every one of Sam\'s files.',
        'Rename any of Sam\'s files that don\'t follow it. Keep each extension.',
        'Decide how your rule shows that one file is a newer version of another.',
        'Use your rule to name a new file: Sam\'s Science notes on earthquakes. Write the name down.',
        'Ask a partner to look for a name that breaks your rule. Fix your rule or the file.'
      ] },
      { type: 'choice', id: 'naming', question: 'You want your files to sort in date order when they\'re sorted by name. Which pattern works?', options: [
        '`march-2027-history.txt`',
        '`2027-03-history.txt`',
        '`history-march-2027.txt`'
      ], answer: 1, explain: 'Names sort from the first character. Starting with the year, then a two-digit month, keeps them in date order. Month names would sort alphabetically, so April would come before March.' }
    ],

    'L1-EXTRA-04': [
      { type: 'objective', text: 'Finished early? Find things without opening every folder. This doesn\'t count towards your progress.' },
      { type: 'concept', text: 'Every file has a size and a date. **KB**, **MB** and **GB** measure size. About 1,000 KB make 1 MB, and about 1,000 MB make 1 GB. The **date modified** tells you when a file was last saved.' },
      { type: 'steps', title: 'Get a fresh copy', intro: 'You have already renamed Sam\'s files, so use a new copy here.', steps: [
        'Download Sam\'s files again using the button below.',
        'Extract them in the same way as in the rescue challenge, and leave them in **Downloads**.',
        'Open the new `Sams files` folder.'
      ] },
      { type: 'download', file: 'sams-files.zip', label: 'Download sams-files.zip' },
      { type: 'steps', title: 'Sort and search', steps: [
        { win: 'Click **View**, then **Details**.', mac: 'Click **View** in the menu bar, then **as List**.' },
        'Click the **Size** heading to sort by size. Click it again to reverse the order.',
        { win: 'Click the **Date modified** heading to sort by date.', mac: 'Click the **Date Modified** heading to sort by date.' },
        { win: 'Click in the search box at the top right, then type `*.pdf`. The star means "any name".', mac: 'Click the magnifying glass at the top right and type `.pdf`. Then click **Sams files** next to **Search**, so that you only search this folder.' }
      ] },
      { type: 'choice', id: 'find1', question: 'Which of Sam\'s files is the largest?', options: ['`assignment final FINAL v2.docx`', '`IMG_2041.jpg`', '`logo-new.png`'], answer: 2, explain: 'It\'s about 12 KB. Pictures are often larger than files that only hold text.' },
      { type: 'choice', id: 'find2', question: 'Which of these did Sam save most recently?', options: ['`todo.txt`', '`assignment final FINAL v2.docx`', '`timetable.pdf`'], answer: 1, explain: 'This can also help when you have two versions of a file. Check the date as well as the name, because anyone can put "final" in a name.' },
      { type: 'choice', id: 'find3', question: 'How many PDF files does Sam have?', options: ['3', '4', '6'], answer: 1, explain: 'Searching by extension finds every file of that type, even inside other folders.' },
      { type: 'match', id: 'email-size', prompt: 'You can attach up to 25 MB to an email. Can you attach each of these?', choices: ['Fits', 'Too big'], items: [
        { text: 'A 900 KB essay', answer: 'Fits' },
        { text: 'A 12 MB slideshow', answer: 'Fits' },
        { text: 'A 30 MB slideshow', answer: 'Too big' },
        { text: 'A 2 GB video', answer: 'Too big' }
      ] },
      { type: 'tip', text: 'When you\'re finished, delete this new copy of Sam\'s files, so you don\'t mix it up with your organised folder.' }
    ],

    'L1-EXTRA-05': [
      { type: 'objective', text: 'Finished early? Work out how the cloud can leave you with two versions of a file. This doesn\'t count towards your progress.' },
      { type: 'concept', text: 'Your essay syncs between your laptop and the cloud. On the bus, with no internet, you add a paragraph on your laptop. That night, before your laptop reconnects, you use another computer to change the ending of the cloud copy.' },
      { type: 'choice', id: 'sync1', question: 'While you are on the bus, what is in the cloud copy?', options: ['Your new paragraph, because it syncs straight away', 'Not your new paragraph, because the laptop can\'t sync without internet', 'Nothing, because the cloud copy is deleted when you go offline'], answer: 1, explain: 'Your change stays on the laptop until it can connect again.' },
      { type: 'choice', id: 'sync2', question: 'What is the problem when your laptop reconnects?', options: ['There are two different versions, and each has a change the other doesn\'t', 'Nothing, because the newest version has all your work', 'The laptop has to be reset'], answer: 0, explain: 'This is called a **sync conflict**. Keeping only one version would lose either the paragraph or the new ending.' },
      { type: 'choice', id: 'sync3', question: 'You now see `essay.docx` and `essay-LAPTOP.docx`. What should you do first?', options: ['Delete the one with the longer name', 'Open both and compare them', 'Rename them both'], answer: 1, explain: 'Cloud apps handle conflicts in different ways, and some keep both copies under different names. Compare them, combine the changes into one file, and remove the extra one only after that.' },
      { type: 'tip', text: 'To avoid a conflict, let your file finish syncing before you close your laptop, and work on it in one place at a time.' }
    ],

    'L1-EXTRA-06': [
      { type: 'objective', text: 'Finished early? Show that a file isn\'t tied to one app. This doesn\'t count towards your progress.' },
      { type: 'concept', text: 'The app that opens when you double-click a file is its **default app**. You can choose a different app, as long as it understands that type of file.' },
      { type: 'steps', title: 'Open one photo in two apps', steps: [
        'Open **Year 9** and double-click `sunset.jpg`. Note which app opens, then close it.',
        { win: 'Right-click `sunset.jpg`, point to **Open with**, then click **Paint**. If you can\'t see it, click **Choose another app**.', mac: 'Right-click `sunset.jpg`, point to **Open With**, then click **Safari**. If you can\'t see it, click **Other**.' },
        'Close the app without saving. If you are asked about always using this app, say no, so that your default stays the same.'
      ] },
      { type: 'choice', id: 'apps1', question: 'What changed in `sunset.jpg` when you opened it in another app?', options: ['Its extension', 'Its location', 'Nothing'], answer: 2, explain: 'You only changed which tool opened the file. The file only changes if you save over it.' },
      { type: 'choice', id: 'apps2', question: 'Your friend doesn\'t have Word. Can they still read your `essay.docx`?', options: ['No, a `.docx` file only opens in Word', 'Yes, if they use another app that understands `.docx`, such as Google Docs', 'Only if they rename it first'], answer: 1, explain: 'Different apps can often open the same file type, although the layout may look a little different.' }
    ]
  };
}
