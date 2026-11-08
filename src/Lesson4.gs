/**
 * What students read and do in "Working in VS Code" (lesson ID L4, shown third). Students use
 * VS Code for Python from Term 1. Installing Python is outside this lesson, so the core works
 * without it: the Python extension underlines mistakes even with no Python installed. Running a
 * program is an extra challenge.
 *
 * Students learn where the AI features are and how to turn them off. The AI lesson mentions
 * this again. VS Code changes every month, so check the AI and install steps each term.
 *
 * Text marks: **bold**, `file or code`, [[key on the keyboard]]. Anything can be { win, mac }.
 */
/** Installing VS Code. Shared by this lesson and the homework at the end of Lesson 2. */
function installVsCodeSteps_() {
  return [
    'In your browser, go to `code.visualstudio.com`.',
    { win: 'Click **Download for Windows**, then open the file when it has downloaded.', mac: 'Click **Download for macOS**, then open the download. You get an app called **Visual Studio Code**.' },
    { win: 'Accept the agreement, then click **Next** on each page, leaving the settings as they are. Click **Install**.', mac: 'Drag **Visual Studio Code** onto **Applications** in the Finder sidebar. Left in Downloads, it may not update properly.' },
    { win: 'Click **Finish** to open VS Code.', mac: 'Press [[Command]] + [[Space]], type `Visual Studio Code`, then press [[Return]]. If your Mac asks whether you\'re sure, click **Open**.' }
  ];
}

/**
 * Installing Python, from python.org's current instructions (checked November 2026). On Windows
 * that's the Python install manager, which installs the latest Python the first time `python`
 * runs. Check these each year, because the Windows installer has been changing.
 */
function installPythonSteps_() {
  return [
    { win: 'Open the **Microsoft Store**, search for `Python install manager`, and check it\'s from the **Python Software Foundation**. Click **Install**.', mac: 'In your browser, go to `python.org/downloads` and click the yellow **Download Python** button.' },
    { win: 'Press [[Windows]], type `Terminal`, then press [[Enter]]. On older Windows, type `PowerShell` instead.', mac: 'Open the download. Click **Continue** and **Agree** until you can click **Install**, then type your Mac password if asked.' },
    { win: 'Type `python` and press [[Enter]]. If it asks questions, press [[Enter]] to accept each suggested answer. Wait while Python installs.', mac: 'When it says the installation was successful, click **Close**.' },
    { win: 'When you see `>>>`, Python is working. Type `exit()` and press [[Enter]], then close the window.', mac: 'Press [[Command]] + [[Space]], type `Terminal`, then press [[Return]]. Type `python3 --version` and press [[Return]]. If you see a version number, such as `Python 3.15.2`, Python is working.' }
  ];
}

function lesson4Content_() {
  var KEY = function (win, mac) { return { win: win, mac: mac }; };

  return {
    'L4-TOOLS-01': [
      { type: 'objective', text: 'By the end of this section, you can say why programmers use a code editor.' },
      { type: 'tip', text: 'You should have installed VS Code and Python for homework at the end of Lesson 2. If you haven\'t, tell your teacher now. You can install VS Code in the next section.' },
      { type: 'concept', text: 'A **code editor** is like Notepad or TextEdit, built for code. It colours code so it\'s easier to read, numbers every line, and underlines mistakes before you run anything. **VS Code** is the code editor you\'ll use for Python this year.' },
      { type: 'choice', id: 'editor', question: 'Which of these can VS Code do that Notepad and TextEdit can\'t?', options: ['Save a file', 'Underline a mistake in your code before you run it', 'Open a `.txt` file'], answer: 1, explain: 'All three apps can save and open text files. Only a code editor understands code well enough to spot mistakes.' },
      { type: 'tip', text: 'VS Code is short for Visual Studio Code. It\'s free, from Microsoft. Don\'t confuse it with **Visual Studio**, which is a different and much bigger app.' }
    ],

    'L4-INSTALL-01': [
      { type: 'objective', text: 'By the end of this section, VS Code is installed and ready for Python.' },
      { type: 'tip', text: 'Already have VS Code? Open it, then skip to **Add the Python extension**.' },
      { type: 'steps', title: 'Install VS Code', steps: installVsCodeSteps_() },
      { type: 'tip', text: { win: 'To open it next time, press [[Windows]], type `code`, then press [[Enter]].', mac: 'To keep it in the Dock, right-click its icon while it\'s open, then click **Options**, then **Keep in Dock**. Spotlight works too.' } },
      { type: 'tick', task: 'L4-INSTALL-01' },
      { type: 'tick', task: 'L4-INSTALL-02' },
      { type: 'steps', title: 'Add the Python extension', intro: 'An **extension** adds a feature to VS Code. The Python extension teaches VS Code to understand Python.', steps: [
        { win: 'Press [[Ctrl]] + [[Shift]] + [[X]] to open **Extensions**.', mac: 'Press [[Command]] + [[Shift]] + [[X]] to open **Extensions**.' },
        'Search for `Python`.',
        'Click the one called **Python** from **Microsoft**, with a blue tick next to Microsoft. Click **Install**.',
        'If a message says Python isn\'t installed, close it. You don\'t need Python for this lesson.'
      ] },
      { type: 'tip', text: 'Only install extensions your teacher asks for. An extension can do anything on your computer, so check who made it.' },
      { type: 'tick', task: 'L4-INSTALL-03' }
    ],

    'L4-AI-01': [
      { type: 'objective', text: 'By the end of this section, you know where VS Code\'s AI features are, and they are turned off.' },
      { type: 'concept', text: 'VS Code has AI features built in. There\'s a **chat** you can ask questions, and grey **suggestions** that appear as you type, offering to finish your code. Each task tells you whether AI is allowed. With these features off, AI can\'t add anything to your work unless you choose to turn it back on for a task that allows it.' },
      { type: 'steps', title: 'Find them first', intro: 'Depending on your version, you may see some or all of these.', steps: [
        'A chat icon at the top of the window, near the search box.',
        'A chat panel, often down the right-hand side.',
        'A small Copilot icon in the bar along the bottom of the window.'
      ] },
      { type: 'tick', task: 'L4-AI-01' },
      { type: 'steps', title: 'Turn them off', steps: [
        { win: 'Press [[Ctrl]] + [[,]] to open **Settings**.', mac: 'Press [[Command]] + [[,]] to open **Settings**.' },
        'In the search box at the top, type `chat.disableAIFeatures`.',
        'Tick the box under **Disable AI Features**.',
        'Check that the chat panel and the AI icons have gone, then close the **Settings** tab.'
      ] },
      { type: 'tip', text: 'VS Code updates often. If the AI features come back after an update, repeat these steps. If you can\'t find the setting, ask your teacher.' },
      { type: 'tick', task: 'L4-AI-02' },
      { type: 'choice', id: 'ai-suggestion', question: 'A grey suggestion appears that would finish your code for you. The task says no AI. What should you do?', options: ['Accept it if it looks right', 'Ignore it, and check the AI features are turned off', 'Accept it, then change a few words'], answer: 1, explain: 'Accepting it, even with changes, means AI wrote part of your work. Turning the features off stops it happening again.' }
    ],

    'L4-FOLDER-01': [
      { type: 'objective', text: 'By the end of this section, you can open a project folder in VS Code.' },
      { type: 'concept', text: 'VS Code works best when you open a **folder**, not a single file. The folder is your project. The **Explorer** on the left then shows every file in it, matching the folder on your computer.' },
      { type: 'steps', title: 'Get the Python folder', steps: [
        'Download the starter files using the button below.',
        { win: 'Go to **Downloads**, right-click `python-starter.zip`, click **Extract All**, then click **Extract**.', mac: 'Go to **Downloads** and double-click `python-starter.zip`.' },
        'Move the new `Python` folder into **Documents › Year 9**.'
      ] },
      { type: 'download', file: 'python-starter.zip', label: 'Download python-starter.zip' },
      { type: 'steps', title: 'Open the folder in VS Code', steps: [
        { win: 'In VS Code, click **File**, then **Open Folder**.', mac: 'In VS Code, click **File** in the menu bar, then **Open Folder**. On some Macs it\'s called **Open**.' },
        { win: 'Go to **Documents › Year 9**, click the **Python** folder once, then click **Select Folder**.', mac: 'Go to **Documents › Year 9**, click the **Python** folder once, then click **Open**.' },
        'If VS Code asks whether you trust the authors, click **Yes, I trust the authors**. You do: it\'s your folder.',
        'In the Explorer on the left, click `guess-game` to see inside it.',
        { win: 'Open the same folder in File Explorer, and compare the two lists.', mac: 'Open the same folder in Finder, and compare the two lists.' }
      ] },
      { type: 'tick', task: 'L4-FOLDER-01' },
      { type: 'tick', task: 'L4-FOLDER-02' },
      { type: 'diagram', svg: vscodeDiagram_(), alt: 'A drawing of VS Code. 1: the Activity Bar down the left. 2: the Explorer, showing the PYTHON folder. 3: a tab with a dot, which means unsaved changes. 4: a wavy line under a mistake. 5: the Problems panel, listing "nmae is not defined" on line 3.', caption: '**1** Activity Bar **2** Explorer, your folder **3** A dot means not saved **4** A wavy line marks a mistake **5** Problems panel' },
      { type: 'tip', text: 'Opened one file instead of the folder? The Explorer says **No Folder Opened**. Use **Open Folder** instead.' }
    ],

    'L4-SAVE-01': [
      { type: 'objective', text: 'By the end of this section, you can tell whether your work is saved.' },
      { type: 'concept', text: 'When a file has changes that aren\'t saved, its tab shows a **dot** instead of an ×. The dot means what\'s on screen isn\'t in the file yet. Programs run the saved file, so an unsaved fix doesn\'t count.' },
      { type: 'steps', title: 'Spot the dot', steps: [
        'Click `compare.py` in the Explorer to open it.',
        'Change `Year 9` in the message to anything you like.',
        'Look at the tab. There\'s a dot where the × was.',
        { win: 'Press [[Ctrl]] + [[S]]. The dot turns back into an ×.', mac: 'Press [[Command]] + [[S]]. The dot turns back into an ×.' }
      ] },
      { type: 'tick', task: 'L4-SAVE-01' },
      { type: 'steps', title: 'Find Auto Save', steps: [
        'Click **File** in the menu bar.',
        'Find **Auto Save**. A tick next to it means it\'s on.',
        'Decide whether you want it on, then tell the person next to you what you chose and why.'
      ] },
      { type: 'tick', task: 'L4-SAVE-02' },
      { type: 'tip', text: 'This is the same idea as Lesson 2. TextEdit saves for you, while Notepad waits until you save. VS Code does whichever you choose.' },
      { type: 'choice', id: 'unsaved-fix', question: 'Auto Save is off. You fix a mistake, and the tab still shows a dot. You hand in the file now. Is your fix in it?', options: ['Yes, because you can see it on screen', 'No, because the dot means it isn\'t saved'], answer: 1, explain: 'The file you hand in is the saved file. Save first, and check that the dot has gone.' }
    ],

    'L4-FILES-01': [
      { type: 'objective', text: 'By the end of this section, you can manage your project\'s files without leaving VS Code.' },
      { type: 'concept', text: { win: 'Anything you do in VS Code\'s Explorer happens to the real files, exactly as if you did it in File Explorer.', mac: 'Anything you do in VS Code\'s Explorer happens to the real files, exactly as if you did it in Finder.' } },
      { type: 'steps', title: 'Make a file and a folder', steps: [
        'Point to the **PYTHON** heading in the Explorer. Small buttons appear.',
        'Click **New File**, type `hello.py`, then press [[Enter]].',
        'Click **New Folder**, type `practice`, then press [[Enter]].',
        'Drag `hello.py` onto the `practice` folder.',
        { win: 'In File Explorer, open **Documents › Year 9 › Python › practice**. `hello.py` is there.', mac: 'In Finder, open **Documents › Year 9 › Python › practice**. `hello.py` is there.' }
      ] },
      { type: 'tick', task: 'L4-FILES-01' },
      { type: 'steps', title: 'Rename and delete', steps: [
        'In VS Code, right-click `hello.py`, click **Rename**, type `first.py`, then press [[Enter]].',
        'Right-click `first.py`, click **Delete**, then confirm.',
        { win: 'Check the **Recycle Bin**. Deleted files go there, just as they do from File Explorer.', mac: 'Check the **Bin** in the Dock. Deleted files go there, just as they do from Finder.' }
      ] },
      { type: 'tick', task: 'L4-FILES-02' },
      { type: 'tip', text: 'A new file goes inside whichever folder is selected. Click an empty space in the Explorer first to make it at the top level.' }
    ],

    'L4-WARN-01': [
      { type: 'objective', text: 'By the end of this section, you can find and fix mistakes using VS Code\'s warnings.' },
      { type: 'concept', text: 'VS Code checks your code as you type. A **wavy line** under code marks a problem: red for a mistake that stops the program working, and yellow for something that\'s probably wrong. The **Problems** panel lists them all, with line numbers.' },
      { type: 'steps', title: 'Fix broken.py', steps: [
        'Open `broken.py`.',
        { win: 'Press [[Ctrl]] + [[Shift]] + [[M]] to open the **Problems** panel.', mac: 'Press [[Command]] + [[Shift]] + [[M]] to open the **Problems** panel.' },
        'Click a problem to jump to its line. Point to the wavy line to read the message.',
        'Fix that mistake and save. Fixing one mistake can show another that was hidden behind it.',
        'Keep going until the Problems panel is empty and the tab has no dot.'
      ] },
      { type: 'tip', text: 'Line numbers run down the left of the code. "Ln 6" in a message means the sixth line.' },
      { type: 'choice', id: 'not-defined', question: 'VS Code says `"nmae" is not defined`. What is most likely wrong?', options: ['Python isn\'t installed', 'A name is spelt differently from where it was made', 'The file isn\'t saved'], answer: 1, explain: 'Python treats `nmae` and `name` as two different names, and `nmae` was never given a value.' }
    ],

    'L4-FIND-01': [
      { type: 'objective', text: 'By the end of this section, you can find any command or file quickly.' },
      { type: 'keys', title: 'Useful shortcuts', rows: [
        ['Command Palette', KEY('[[Ctrl]] + [[Shift]] + [[P]]', '[[Command]] + [[Shift]] + [[P]]')],
        ['Open a file by name', KEY('[[Ctrl]] + [[P]]', '[[Command]] + [[P]]')],
        ['Search every file', KEY('[[Ctrl]] + [[Shift]] + [[F]]', '[[Command]] + [[Shift]] + [[F]]')],
        ['Problems', KEY('[[Ctrl]] + [[Shift]] + [[M]]', '[[Command]] + [[Shift]] + [[M]]')],
        ['Save', KEY('[[Ctrl]] + [[S]]', '[[Command]] + [[S]]')],
        ['Settings', KEY('[[Ctrl]] + [[,]]', '[[Command]] + [[,]]')]
      ] },
      { type: 'steps', title: 'Try them', steps: [
        'Open the **Command Palette** and type `auto save`. You\'ll see **File: Toggle Auto Save**. Press [[Esc]] to close it without changing anything.',
        'Search every file for `print`. Every file that uses it is listed.',
        'Open a file by name: type `guess`, then press [[Enter]] to open `guess.py`.'
      ] },
      { type: 'tip', text: 'If you forget where something is, the Command Palette can usually find it. Type a word or two of what you want.' }
    ],

    'L4-CHALLENGE-02': [
      { type: 'objective', text: 'Tidy a friend\'s guessing game and make it work, using only VS Code. Don\'t use File Explorer or Finder.' },
      { type: 'concept', text: 'Your friend\'s `guess-game` folder is a mess, and the program has mistakes in it. Use everything from this lesson to sort it out.' },
      { type: 'steps', title: 'Your goals', steps: [
        'In `guess-game`, make a folder called `archive`, and move `guess-old.py` into it.',
        'Make a folder called `notes`, and move both `.txt` files into it.',
        'Delete `Untitled-1.py`. It\'s empty.',
        'Open `guess.py` and fix every problem, then save it.'
      ] },
      { type: 'tick', task: 'L4-CHALLENGE-02' },
      { type: 'steps', title: 'Checklist', steps: [
        '`guess-game` has `guess.py` and two folders, `archive` and `notes`, and nothing else.',
        'With `guess.py` open, the Problems panel shows no problems.',
        'The tab for `guess.py` has no dot.'
      ] },
      { type: 'tick', task: 'L4-CHALLENGE-03' }
    ],

    'L4-EXTRA-02': [
      { type: 'objective', text: 'Finished early, and already have Python installed? Run the guessing game. This doesn\'t count towards your progress.' },
      { type: 'steps', title: 'Run it', steps: [
        'Open `guess.py`.',
        'Click the ▶ button at the top right of the window.',
        'A **terminal** panel opens at the bottom. Click in it, type a guess, then press [[Enter]].',
        'Keep guessing until you win.'
      ] },
      { type: 'tip', text: 'If a message says Python can\'t be found, Python isn\'t installed on this laptop. That\'s fine: it\'s set up separately.' }
    ],

    'L4-EXTRA-03': [
      { type: 'objective', text: 'Finished early? Make VS Code comfortable to use. This doesn\'t count towards your progress.' },
      { type: 'steps', title: 'Make it yours', steps: [
        'Open the **Command Palette**, type `color theme`, then press [[Enter]]. Use the arrow keys to try themes, and press [[Enter]] on the one you like.',
        'Open **Settings**, search for `font size`, and change **Editor: Font Size**.',
        'Pick a size you can read easily from where you normally sit.'
      ] }
    ]
  };
}
