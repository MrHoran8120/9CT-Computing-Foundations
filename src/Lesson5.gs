/**
 * What students read and do in "Taking control of your files". Its ID is L5 because it was added
 * after the other lessons, but students see it second. Each list belongs to the section whose
 * first task has that ID. Wording here can change freely.
 *
 * Students save with Notepad or TextEdit. Like VS Code, which they use later, these apps make
 * them choose a name and a folder, and show when there are unsaved changes.
 *
 * Text marks: **bold**, `file or code`, [[key on the keyboard]]. Anything can be { win, mac }.
 */
function lesson5Content_() {
  var EXTRACT = function (zipName, folder) {
    return [
      'Download the file using the button below.',
      { win: 'Go to **Downloads**, right-click `' + zipName + '`, click **Extract All**, then click **Extract**.', mac: 'Go to **Downloads** and double-click `' + zipName + '`.' },
      'Move the new `' + folder + '` folder into **Documents › Year 9**, then open it.'
    ];
  };
  var DETAILS = { win: 'Click **View**, then **Details**, so that you can see the files in a list.', mac: 'Click **View** in the menu bar, then **as List**.' };

  return {
    'L5-RECALL-01': [
      { type: 'objective', text: 'Start by finding last lesson\'s work on your own. There are no step-by-step instructions this time.' },
      { type: 'steps', title: 'Your challenge', steps: [
        'Open the folder where you put Sam\'s files.',
        'Open any one of the files.',
        'Work out its full path and its extension. Say them to the person next to you.'
      ] },
      { type: 'tip', text: 'Forgotten a step? Use the search box at the top of this page, such as `path` or `extension`.' },
      { type: 'tip', text: 'Can\'t find your Lesson 1 work, or using a different laptop? Make the folder **Documents › Year 9** now and carry on. You\'ll get new files in the next section.' }
    ],

    'L5-SELECT-01': [
      { type: 'objective', text: 'By the end of this section, you can select several files at once and move or copy them together.' },
      { type: 'steps', title: 'Get the practice files', steps: EXTRACT('practice-files.zip', 'Practice files').concat([
        DETAILS,
        'Click the **Name** heading to sort the files by name.'
      ]) },
      { type: 'download', file: 'practice-files.zip', label: 'Download practice-files.zip' },
      { type: 'diagram', svg: { win: selectDiagram_('win'), mac: selectDiagram_('mac') }, alt: { win: 'Two lists of files. On the left, four files in a row are selected: click the first, then Shift + click the last. On the right, two separate files are selected by holding Ctrl and clicking each one.', mac: 'Two lists of files. On the left, four files in a row are selected: click the first, then Shift + click the last. On the right, two separate files are selected by holding Command and clicking each one.' } },
      { type: 'keys', title: 'Selecting files', rows: [
        ['A block', 'Click the first file, then hold [[Shift]] and click the last'],
        ['Separate files', { win: 'Hold [[Ctrl]] and click each file', mac: 'Hold [[Command]] and click each file' }],
        ['Everything', { win: '[[Ctrl]] + [[A]]', mac: '[[Command]] + [[A]]' }],
        ['Unselect one', { win: 'Hold [[Ctrl]] and click it again', mac: 'Hold [[Command]] and click it again' }],
        ['Start again', 'Click an empty space in the folder']
      ] },
      { type: 'choice', id: 'select-predict', question: 'Predict: you click `notes-art.txt`, then hold Shift and click `notes-science.txt`. How many files are selected?', options: ['2', '4', 'Every file in the folder'], answer: 1, explain: 'Shift selects the two files you clicked and everything between them: art, history, maths and science.' },
      { type: 'steps', title: 'Move a block of files', steps: [
        { win: 'In **Practice files**, click **New**, then **Folder**, and call it `Photos`.', mac: 'In **Practice files**, click **File** in the menu bar, then **New Folder**, and call it `Photos`.' },
        'Select `photo-01.jpg` to `photo-03.jpg` as a block.',
        'Drag the selected photos onto the **Photos** folder. Dragging any one of them moves them all.',
        'Check: **Photos** has three photos, and `poster.png` is still in **Practice files**.'
      ] },
      { type: 'steps', title: 'Copy files that aren\'t together', steps: [
        'Make another folder in **Practice files**, called `Revision`.',
        { win: 'Select `notes-history.txt` and `notes-science.txt` using [[Ctrl]].', mac: 'Select `notes-history.txt` and `notes-science.txt` using [[Command]].' },
        { win: 'Press [[Ctrl]] + [[C]], open **Revision**, then press [[Ctrl]] + [[V]].', mac: 'Press [[Command]] + [[C]], open **Revision**, then press [[Command]] + [[V]].' },
        'Check: **Revision** has two files, and all four notes are still in **Practice files**.'
      ] },
      { type: 'tip', text: 'Selected the wrong files? Click an empty space in the folder to clear the selection, then start again.' }
    ],

    'L5-SAVE-01': [
      { type: 'objective', text: 'By the end of this section, you can save a file where you choose, then find it and open it again.' },
      { type: 'concept', text: 'Saving means choosing two things: a **name** and a **location**. If you only choose the name, your file goes wherever the app suggests, and that can be hard to find later.' },
      { type: 'steps', title: 'Write something', steps: [
        { win: 'Press [[Windows]], type `Notepad`, then press [[Enter]].', mac: 'Press [[Command]] + [[Space]], type `TextEdit`, then press [[Return]]. Click **New Document**.' },
        { win: 'Type a heading, `My goals this term`, and two goals underneath it.', mac: 'Click **Format** in the menu bar, then **Make Plain Text**. This makes a plain `.txt` file, like Notepad on Windows.' },
        { win: 'Look at the top of the window. A dot or a star (*) next to the name means there are changes that aren\'t saved yet.', mac: 'Type a heading, `My goals this term`, and two goals underneath it.' },
        { win: 'Press [[Ctrl]] + [[S]] to save.', mac: 'Look at the top of the window. **Edited** next to the name means there are changes that aren\'t saved yet.' }
      ] },
      { type: 'diagram', svg: { win: saveDialogDiagram_('win'), mac: saveDialogDiagram_('mac') }, alt: { win: 'The Save As window. 1: the bar at the top shows the folder, Documents then Year 9. 2: the file name box holds my-plan.txt. 3: the Save button.', mac: 'The Save window. 1: Where shows the folder, Year 9. 2: Save As holds the name my-plan.txt. 3: the Save button.' }, caption: { win: '**1** Choose the location. **2** Type the name. **3** Click **Save**.', mac: '**1** Choose the location. **2** Type the name. **3** Click **Save**.' } },
      { type: 'steps', title: 'Save it on purpose', steps: [
        { win: 'In the window that opens, click **Documents** in the left pane, then double-click **Year 9**.', mac: 'Press [[Command]] + [[S]]. If the window is small, click the arrow next to the name to see more folders.' },
        { win: 'Click in **File name** and type `my-plan.txt`.', mac: 'Choose **Documents**, then **Year 9**.' },
        { win: 'Check the bar at the top says **Year 9**, then click **Save**.', mac: 'In **Save As**, type `my-plan.txt`, then click **Save**.' },
        { win: 'Close Notepad.', mac: 'Press [[Command]] + [[Q]] to quit TextEdit.' }
      ] },
      { type: 'steps', title: 'Find it and open it again', steps: [
        { win: 'Open File Explorer and go to **Documents › Year 9**.', mac: 'Open Finder and go to **Documents › Year 9**.' },
        'Double-click `my-plan.txt`. Your goals should be there.'
      ] },
      { type: 'concept', text: { win: 'Notepad only changes your file when you save. Newer versions may remember unsaved text when you reopen Notepad, but that text isn\'t in your file until you save. VS Code, which you\'ll use later, can save for you or wait for you, so always check.', mac: 'Once a file has a name, TextEdit usually saves your changes for you. This is called **autosave**. Not every app does this. VS Code, which you\'ll use later, can save for you or wait for you, so always check.' } },
      { type: 'choice', id: 'unsaved', question: 'In an app without autosave, you add a paragraph but don\'t save. Then you attach the file to an email. What does your teacher get?', options: ['Your work with the new paragraph', 'The last version you saved', 'An empty file'], answer: 1, explain: 'An attachment is the file as it is stored. Changes you haven\'t saved are only in the app\'s window.' },
      { type: 'steps', title: 'Make a second version', intro: 'Now make a separate copy with a new name, so the first version stays safe.', steps: [
        { win: 'In Notepad, with `my-plan.txt` open, click **File**, then **Save As**.', mac: 'In TextEdit, with `my-plan.txt` open, click **File**, then **Duplicate**. A copy opens in a new window.' },
        { win: 'Stay in **Year 9**, type `my-plan-v2.txt` as the name, and click **Save**.', mac: 'Press [[Command]] + [[S]], type `my-plan-v2.txt` as the name, choose **Year 9**, and click **Save**.' },
        { win: 'Look at the top of the window. You are now working in `my-plan-v2.txt`.', mac: 'Look at the top of the window. You are now working in `my-plan-v2.txt`.' }
      ] },
      { type: 'tip', text: { win: 'Always look at the name at the top of the window before you type. It tells you which file you\'re changing.', mac: 'Hold [[Option]] while the **File** menu is open to see **Save As**. Duplicate is safer in TextEdit, because it makes the copy before you change anything.' } }
    ],

    'L5-VERSION-01': [
      { type: 'objective', text: 'By the end of this section, you can tell versions of a file apart and choose the right one using evidence.' },
      { type: 'concept', text: 'Each version is a separate file. Changing one never changes the other. That keeps an old version safe, but it means you need to know which one you\'re working on.' },
      { type: 'choice', id: 'version-predict', question: 'Predict: you add a third goal to `my-plan-v2.txt` and save it. What happens to `my-plan.txt`?', options: ['It gets the third goal as well', 'It stays the same', 'It is replaced by the new version'], answer: 1, explain: 'They are two separate files, so a change to one doesn\'t reach the other.' },
      { type: 'diagram', svg: versionsDiagram_(), alt: 'my-plan.txt has two goals. The new version, my-plan-v2.txt, has the same two goals plus a third. Changing the new version leaves the original as it was.' },
      { type: 'steps', title: 'Check your prediction', steps: [
        { win: 'In `my-plan-v2.txt`, add a third goal, then press [[Ctrl]] + [[S]].', mac: 'In `my-plan-v2.txt`, add a third goal, then press [[Command]] + [[S]].' },
        'Close it, then open `my-plan.txt` from **Year 9**.',
        'Does it have the third goal? Close it when you\'ve checked.'
      ] },
      { type: 'steps', title: 'Which speech is complete?', intro: 'There are three versions of a speech in **Practice files**. The teacher asked for a title, three reasons, and a thank-you at the end.', steps: [
        'Open each of the three speech files and check it against what the teacher asked for.',
        { win: 'Click the **Date modified** heading to see which is newest.', mac: 'Click the **Date Modified** heading to see which is newest.' },
        'Decide which one is complete, and what your evidence is.'
      ] },
      { type: 'choice', id: 'speech', question: 'Which speech has everything the teacher asked for?', options: ['`speech.txt`', '`speech-final.txt`', '`speech-final-v2.txt`'], answer: 1, explain: '`speech.txt` only has two reasons. `speech-final-v2.txt` is the newest, but it has no thank-you. Names and dates are clues, but what\'s inside is the evidence.' },
      { type: 'choice', id: 'evidence', question: 'What is the best evidence that a file is the one to hand in?', options: ['Its name has "final" in it', 'It has the newest date', 'What\'s inside matches everything the task asks for'], answer: 2, explain: 'Anyone can type "final" in a name, and opening an old file to fix one thing can give it the newest date.' }
    ],

    'L5-FIND-01': [
      { type: 'objective', text: 'By the end of this section, you can find a file when you don\'t know where it is, and then find out where it\'s stored.' },
      { type: 'concept', text: 'Search finds a file, but it doesn\'t tell you much about it. Before you change or hand in a file, find out which folder it\'s really in, so you know you have the right one.' },
      { type: 'steps', title: 'Search for it', intro: 'Your teacher needs your excursion form. It\'s somewhere inside **Practice files**.', steps: [
        'Open **Practice files**.',
        { win: 'Click in the search box at the top right, type `excursion`, then press [[Enter]].', mac: 'Click the magnifying glass at the top right and type `excursion`. Then click **Practice files** next to **Search**, so that you only search this folder.' }
      ] },
      { type: 'steps', title: 'Find where it lives', steps: [
        { win: 'Right-click `excursion-form.pdf` in the results, then click **Open file location**.', mac: 'Right-click `excursion-form.pdf` in the results, then click **Show in Enclosing Folder**.' },
        { win: 'Read the bar at the top to see the folder it\'s in.', mac: 'Click **View** in the menu bar, then **Show Path Bar** if you can\'t see it. Read the bar at the bottom to see the folder it\'s in.' }
      ] },
      { type: 'choice', id: 'where', question: 'Which folder is `excursion-form.pdf` in?', options: ['Practice files', 'Practice files › old stuff › 2026 › misc', 'Practice files › old stuff › 2025'], answer: 1, explain: 'Search looks inside every folder within the one you searched, which is how it found a file three folders down.' },
      { type: 'tip', text: { win: 'File Explorer also lists files you opened recently. Click **Home** in the left pane, or **Quick access** on older Windows. Check where a recent file is stored before you change it.', mac: 'Finder also lists files you used recently. Click **Recents** in the sidebar. Check where a recent file is stored before you change it.' } },
      { type: 'tip', text: 'Search can find two files with the same name in different places, such as a copy in **Downloads**. Check the location of the one you open.' }
    ],

    'L5-RECOVER-01': [
      { type: 'objective', text: 'Use everything from today to rescue a messy project, and make sure the right version is ready to hand in.' },
      { type: 'concept', text: 'Alex\'s science group has a garden report due tomorrow. Their folder is a mess, there are three reports, and nobody is sure which one is right. This time you decide how to do each step.' },
      { type: 'steps', title: 'Get the project', steps: EXTRACT('garden-project.zip', 'Garden project') },
      { type: 'download', file: 'garden-project.zip', label: 'Download garden-project.zip' },
      { type: 'steps', title: 'Your goals', steps: [
        'Read `task-sheet.pdf`. Find the one report that has all five parts, using what\'s inside as evidence.',
        'Make folders that make sense. Use multiple selection to move the two images together.',
        'Make a folder called `Archive`, and put all three original reports in it. Don\'t change them.',
        'Open the complete report from **Archive** and make a new version of it, outside **Archive**, with a name that makes clear it\'s the one to hand in.',
        'In your new version, add a last line, `Checked by:` and your first name. Save it.',
        '`netball-training.pdf` isn\'t part of the project. Move it somewhere more sensible.',
        'Close your report, then open it again from its folder. Check that your last line is there.'
      ] },
      { type: 'tip', text: { win: 'Use **Save As** before you change anything, so the copy in **Archive** stays as it was.', mac: 'Use **Duplicate** before you change anything. TextEdit saves changes for you, so typing first would change the copy in **Archive**.' } },
      { type: 'steps', title: 'Checklist', intro: 'Check your work against this list before you tick the last box.', steps: [
        'The two images are together in one folder.',
        '**Archive** has all three original reports, unchanged.',
        'Your new report is outside **Archive**, has a clear name, has all five parts, and ends with your `Checked by:` line.',
        '`netball-training.pdf` is no longer in the project.',
        'Every other file is in a folder that makes sense.',
        'You can explain how you knew which report was complete.'
      ] },
      { type: 'choice', id: 'garden', question: 'Which report did you choose?', options: ['`garden report.txt`', '`Copy of garden report.txt`', '`garden report FINAL.txt`'], answer: 1, explain: 'It\'s the only one with week 4 results and a conclusion. The FINAL one is newer, but it stops after week 3.' }
    ],

    'L5-EXTRA-01': [
      { type: 'objective', text: 'Finished early? Find out how a shortcut differs from the real file. This doesn\'t count towards your progress.' },
      { type: 'concept', text: { win: 'A **shortcut** points to a file somewhere else. It isn\'t the file itself.', mac: 'An **alias** points to a file somewhere else. It isn\'t the file itself.' } },
      { type: 'steps', title: 'Try it', steps: [
        { win: 'In **Year 9**, right-click `my-plan.txt`. Click **Show more options** if you see it, then **Create shortcut**.', mac: 'In **Year 9**, click `my-plan.txt` once, then click **File** in the menu bar, then **Make Alias**.' },
        'Look closely at the new icon. What is different about it?',
        'Double-click the new icon. Which file opens?',
        { win: 'Delete the shortcut, then check that `my-plan.txt` is still there.', mac: 'Delete the alias, then check that `my-plan.txt` is still there.' }
      ] },
      { type: 'choice', id: 'shortcut', question: 'You copy a shortcut to your essay onto a USB drive and take it to school. What happens when you open it on a school computer?', options: ['Your essay opens', 'It doesn\'t open your essay, because the essay is still on your laptop', 'The essay is copied to the school computer'], answer: 1, explain: 'A shortcut only points to a file. When you hand in or move work, always use the real file.' }
    ],

    'L5-EXTRA-02': [
      { type: 'objective', text: 'Finished early? Explain why the newest file isn\'t always the right one. This doesn\'t count towards your progress.' },
      { type: 'choice', id: 'newest1', question: 'Mia has a complete essay and an old draft. She opens the draft to copy one sentence, and saves it by accident. Which file now has the newest date?', options: ['The complete essay', 'The old draft'], answer: 1, explain: 'Saving a file gives it a new date, even if the change was tiny or a mistake.' },
      { type: 'choice', id: 'newest2', question: 'Your group shares a file called `report-FINAL.txt`, and it has the newest date. What should you do before handing it in?', options: ['Hand it in, because it\'s final and newest', 'Open it and check it against the task', 'Rename it to make it newer'], answer: 1, explain: 'The name and date are clues. Only the contents show whether it\'s complete.' },
      { type: 'steps', title: 'Explain it', steps: [
        'Write two sentences explaining why the newest file isn\'t always the complete one.',
        'Give an example from your own work, or from today\'s lesson.'
      ] }
    ]
  };
}
