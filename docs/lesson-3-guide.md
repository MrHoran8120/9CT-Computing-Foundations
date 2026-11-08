# Lesson 3 guide: Working in VS Code

**Time:** 75 minutes. **Students need:** a charged laptop with enough free space for VS Code, about 500 MB, and the app open in its own tab.

**Goal:** students can use VS Code for their Python work: open a project folder, tell whether work is saved, manage files, and fix mistakes from VS Code's warnings. They also know where the AI features are and have turned them off.

**Python itself isn't installed in this lesson.** It should be installed beforehand (see below). The Python extension underlines mistakes even without Python, so the core lesson still works for any student who missed out. Running a program is an extra challenge.

In the code, this lesson's ID is `L4`, because it replaced the old optional toolkit lesson. Students see it as Lesson 3.

## Before the lesson

**Strongly recommended: have VS Code and Python installed on every laptop before this lesson.** Installing in class over school Wi-Fi can easily take longer than the 12 minutes allowed. Students who can't install something, perhaps because of a full disk or a forgotten Mac password, need sorting out before the lesson, not during it. Python also has to be installed before students start their Python work, so doing both at once saves a second round of installing.

**Set it as homework at the end of Lesson 2.** That lesson's last section, **Homework: get ready for Lesson 3**, has the steps for both, with a tick for each. Check the Dashboard before this lesson, because students who haven't ticked both still have Lesson 2 unfinished. Anyone who couldn't install can still install VS Code in this lesson's **Install VS Code** section, but Python isn't covered there.

The install steps are kept in one place, `installVsCodeSteps_()` and `installPythonSteps_()` in `src/Lesson4.gs`:
- **VS Code** comes from `code.visualstudio.com`.
- **Python on Windows** uses the **Python install manager** from the Microsoft Store, which is what python.org now recommends. Students type `python` once in Terminal, and it installs the latest Python. The older installer, with its "Add to PATH" tick box, is being phased out.
- **Python on a Mac** uses the installer from `python.org/downloads`, then a check with `python3 --version` in Terminal.

Check these steps each year, especially on Windows, because Python's installer has been changing. They haven't been tried on a real laptop yet, so try them on one Windows laptop and one Mac before setting the homework.

With Python installed, students can also try the extra challenge of running the guessing game. Without it, the core lesson still works.
- **Check the AI steps on a current version.** VS Code updates every month, and its AI features have moved several times. The lesson uses the setting `chat.disableAIFeatures`, from Microsoft's [Copilot setup docs](https://code.visualstudio.com/docs/copilot/setup). If the label has changed, update `src/Lesson4.gs`.
- **Check that the Python extension underlines mistakes without Python installed.** I expect it does, but this hasn't been tried on a real laptop. If it doesn't, the "Read the warnings" section and the challenge need rethinking.

## Timing

| Minutes | Section | Students do |
|---|---|---|
| 5 | Why a code editor? | One question on what a code editor adds |
| 12 | Install VS Code | Install it, open it, and add the Python extension |
| 5 | Turn off the AI features | Find them, turn them off, and check they've gone |
| 8 | Open a folder, not a file | Get the Python folder and open it in VS Code |
| 8 | Saved or not? | Spot the dot on a tab, and find Auto Save |
| 12 | Files and folders in VS Code | Make, move, rename and delete, then check in File Explorer or Finder |
| 12 | Read the warnings | Fix the three mistakes in `broken.py` |
| 3 | Finding your way | The Command Palette, opening a file by name, and searching every file |
| 10 | Challenge | Tidy the guessing game and fix it using only VS Code |

The two extra challenges are running the game, which needs Python, and changing the theme and font size.

## AI features

Students learn where the chat and suggestions are, then turn them off with **Settings › `chat.disableAIFeatures`**. The AI lesson comes back to this.

- A [reported bug](https://github.com/microsoft/vscode/pull/314340) means an update may turn the setting back on. Ask students to check it at the start of each term, and whenever a chat panel reappears.
- Turning the features off doesn't stop a student turning them back on. It means AI can't add to their work unless they choose to, which fits task sheets that set the AI level.

## Where students may get stuck

- **Opening a file instead of a folder:** the Explorer says **No Folder Opened**. They need **File › Open Folder** (just **Open** on some Macs).
- **Trust prompt:** VS Code asks whether they trust the authors of the folder. It's their own folder, so they click **Yes, I trust the authors**. Without this, some features stay off.
- **"Python is not installed" message:** close it. It doesn't matter for this lesson.
- **Mac app left in Downloads:** if VS Code runs from Downloads, it may not update. Students drag it into **Applications**.
- **Wrong extension:** students should install **Python** from **Microsoft**, with the blue tick. Several look similar.
- **New file in the wrong folder:** a new file goes inside whichever folder is selected. Click an empty space in the Explorer first.
- **One fix reveals another:** in `broken.py`, the unclosed bracket hides the later mistakes until it's fixed.
- **Wavy line colours:** red is a mistake that stops the program, and yellow is probably wrong. The misspelt name may show as yellow.

## Answers

**Code editor question:** underline a mistake in your code before you run it.

**AI suggestion:** ignore it, and check the AI features are turned off.

**Unsaved fix:** no. The dot means it isn't saved.

**"nmae" is not defined:** a name is spelt differently from where it was made.

**broken.py:**
1. Line 3: add the missing `)` to the end of `print("Hello, " + name`.
2. Line 6: add `:` to the end of `if age > 12`.
3. Line 9: change `nmae` to `name`.

**guess.py:**
1. Line 7: add `:` to the end of `while guess != secret`.
2. Line 12: change `pritn` to `print`.

**Finished guessing game folder:** `guess.py`, plus `archive` holding `guess-old.py`, and `notes` holding `high-scores.txt` and `ideas.txt`. `Untitled-1.py` is deleted.
