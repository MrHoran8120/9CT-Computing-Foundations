# Lesson 4 guide: ZIP files and submission

**Time:** 75 minutes. **Students need:** a charged laptop with VS Code from Lesson 3, their **Documents › Year 9** folder, and access to your Google Classroom class.

**Goal:** students can package, extract, repair and hand in a complete project without losing files or breaking it. The key idea is that **a project isn't ready to hand in until it has been extracted somewhere else and tested there.**

In the code, this lesson's ID is `L2`. Students see it as Lesson 4.

## Before the lesson

- **Make a practice task in Google Classroom**, such as "ZIP practice hand-in", with no marks. Students upload their repaired `bake-sale` ZIP to it. Tell students its name, because the app refers to "the practice task your teacher named".
- **Check VS Code opens a folder** on a couple of laptops, because students edit `index.html` in it.

## Timing

| Minutes | Section | Students do |
|---|---|---|
| 5 | What a ZIP is | Predict whether text or photos shrink more |
| 10 | Make a ZIP | Zip two test folders and compare sizes |
| 8 | Extract properly | Extract the bake sale site and move it into Year 9 |
| 10 | Why paths break | Three "Will the logo load?" questions, then sort relative and absolute paths |
| 20 | Repair the bake sale site | Find and fix four faults |
| 10 | Test it somewhere else | Zip the site, extract it on the Desktop and check it works |
| 10 | Hand it in | Spot common mistakes, rename the ZIP, then upload it to Classroom |

The extra challenge adds a second page and tests both links after extracting.

## The bake sale site's four faults

| Fault | What students see | Fix |
|---|---|---|
| The logo uses `file:///C:/Users/sam/Desktop/...`, a full path from Sam's laptop | No logo, just its alt text | Change the path to `images/logo.png` in VS Code |
| `index.html` expects `css/style.css`, but `style.css` is loose in the main folder | No colours or layout | Make a `css` folder and move `style.css` into it, or change the path to `style.css`. Either is fine |
| The script was saved as `js/prices.js.txt` | The total says "calculator not working yet" | Rename it to `prices.js`. Windows warns about changing the extension: click **Yes** |
| `images/team-photo.png` isn't in the ZIP | No team photo | Download `team-photo.png` and move it into `images` |

Only the logo needs code editing. The others are file management, which practises Lessons 1 and 2.

## Where students may get stuck

- **Working inside the ZIP on Windows:** double-clicking a ZIP opens it like a folder, but changes don't stay. Students need **Extract All**.
- **Two copies:** a Mac makes `bake-sale 2` if a ZIP is extracted twice. In the test step, students must open `index.html` from the Desktop copy, not their original.
- **Stale browser page:** students must save in VS Code, then reload the browser with F5 or Command + R.
- **Hidden extensions:** a student who skipped turning on extensions in Lesson 1 won't see `.txt` on the script. Send them back to Lesson 1, section 2.
- **Zipping the wrong thing:** students should zip the `bake-sale` folder itself, not the files inside it.
- **Folder sizes:** File Explorer's Details view doesn't show folder sizes. Students use **Properties** on Windows and **Get Info** on a Mac.

## Answers

**Which shrinks more:** the text notes. They shrink to roughly a tenth of their size, while the photos shrink much less.

**Will the logo load:** Project A yes. Project B no, because it uses an absolute path. Project C no, because the path is missing `images/`.

**Relative or absolute:** `images/logo.png`, `css/style.css` and `js/prices.js` are relative. The paths starting `C:/` and `/Users/` are absolute.

**Hand-in mistakes:** zipping the whole project and testing it is right, and so is `bake-sale-yourname.zip`. Uploading only `index.html`, zipping an older copy, zipping before saving, and `New folder.zip` are all problems.
