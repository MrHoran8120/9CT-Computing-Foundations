# Set up your own copy

This guide is for any teacher who wants to run Computing Foundations with their own classes. Your copy has its own classes and its own private Google Sheet, and it's completely separate from anyone else's. It takes about 20 minutes.

> **Draft:** these steps haven't been tested on a live deployment yet, so some menu names may differ. This note will be removed after the first deployment test.

## What you need

- A **school Google Workspace account**. A personal Gmail account won't work, because the app needs your school's Google domain to identify students.
- Students with accounts in the **same domain** as yours.
- Your school's approval to store student names and email addresses in your Google Sheet, if your school requires it.
- Permission to run Apps Script web apps. Some schools restrict this, so ask your Google administrator if you get stuck at step 4.

## 1. Get the files

On this project's GitHub page, click **Code**, then **Download ZIP**. Extract it, and keep the whole folder together.

## 2. Create the Apps Script project

Choose one of these. Option A does more of the work, but needs Node.js and may be blocked by some schools. Option B only needs a browser.

### Option A: use the setup script

1. Install [Node.js](https://nodejs.org) 20 or later.
2. Turn on the **Google Apps Script API** at [script.google.com/home/usersettings](https://script.google.com/home/usersettings).
3. Open a terminal in the extracted folder. On Windows 11, right-click the folder and choose **Open in Terminal**. On a Mac, right-click the folder and choose **New Terminal at Folder**, if you have that option turned on.
4. Run:

   ```text
   npm run setup
   ```

5. Sign in with your school account if a browser window opens. If it asks about an account that's already signed in, check it's your school account.
6. Choose a name for the project when asked, such as your class code and the course name, or press Enter to use `Computing Foundations`. Students don't see this name.

The script creates the project, uploads the files and deploys the app. It then shows a link to your project. Open it, then go to step 3 of this guide.

The first run downloads `clasp`, Google's tool for uploading Apps Script files, so it may take a minute. The script saves your project and deployment IDs in `.clasp.json` and `.deployment.json`. Keep these files out of any public copy of this project.

### Option B: copy and paste

1. Go to [script.google.com](https://script.google.com), signed in with your school account.
2. Click **New project** and name it `Computing Foundations`.
3. Click **Project Settings** (the gear icon) and tick **Show "appsscript.json" manifest file in editor**.
4. Back in the **Editor**, add each file below and paste in the contents of the matching file from `src`.

| In the editor | Type | Paste from |
|---|---|---|
| `appsscript` | Already there | `src/appsscript.json` |
| `Code` | Already there | `src/Code.gs` |
| `Course` | Script | `src/Course.gs` |
| `Dashboard` | Script | `src/Dashboard.gs` |
| `Diagrams` | Script | `src/Diagrams.gs` |
| `ExerciseFiles` | Script | `src/ExerciseFiles.gs` |
| `Lesson1` | Script | `src/Lesson1.gs` |
| `Lesson2` | Script | `src/Lesson2.gs` |
| `Lesson3` | Script | `src/Lesson3.gs` |
| `Lesson4` | Script | `src/Lesson4.gs` |
| `Lesson5` | Script | `src/Lesson5.gs` |
| `Index` | HTML | `src/Index.html` |
| `Styles` | HTML | `src/Styles.html` |
| `Scripts` | HTML | `src/Scripts.html` |

Names must match exactly, including capitals. The editor adds the file endings itself.

5. Click **Save**.

## 3. Create your Sheet

1. Open the `Code` file. In the function menu at the top, choose **setupSheets**, then click **Run**.
2. Google asks for permission the first time. Review it and allow it. The app only needs your spreadsheets and your email address.
3. The **Execution log** shows a link to your new Sheet, called **Computing Foundations progress**. It's also in your Google Drive.

Keep this Sheet private and don't share it with students. They use the app, and never need access to the Sheet.

## 4. Deploy the app

**If you used the setup script,** the app is already deployed, so don't create another deployment. Click **Deploy**, then **Manage deployments**, and check that the settings match steps 3 and 4 below. Copy the **Web app** URL from there, then go to step 5.

**If you copied and pasted:**

1. Click **Deploy**, then **New deployment**.
2. Click the gear icon and choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone within** your school's domain.
5. Click **Deploy** and copy the **Web app** URL.

Both settings matter. "Execute as Me" lets the app save to your Sheet without students having access to it, and limiting access to your domain lets the app identify each student.

## 5. Add your classes

In the **Classes** tab of your Sheet, add one row per class, starting at row 2:

| Class | Code | Lessons open |
|---|---|---|
| The class name, such as `9CT1` | A code that's hard to guess, such as `maple-42` | How many lessons the class can open, such as `1`, or `all` |

Use a different code for each class, because the code decides which class a student joins. Changes take effect straight away, with no need to redeploy.

**Lessons open** stops keen students racing through the whole course in one night. Before each lesson, increase the number for that class. Lessons are counted in the order students see them, so `3` opens Files, Save and find, and VS Code. Students see later lessons as greyed-out tabs marked **Opens later**, and the app doesn't send their content until you open them. A blank cell opens Lesson 1 only. Students see a change when they next open or reload the app.

You always see every lesson yourself, because the app recognises you as its owner.

Students join on their first visit by entering their name and class code. The app gets their email address from their Google sign-in, and they appear in the **Students** tab. Anyone in your school's Google domain who has the link and a code can join, so only share codes with your class. You might change a code after the class has joined.

To manage students, edit the **Students** tab:

| To do this | Do this |
|---|---|
| Correct a name or move a student to another class | Change their **Name** or **Class**. Rows they've already saved in the **Progress** tab keep the old details until they tick that task again. |
| Remove someone | Type `yes` in their **Blocked** column. They can't use the app or rejoin. Don't delete the row, or they can join again with a code. |

## 6. Link to it from Google Sites

The app opens in its own browser tab, which gives students the full width of the screen. Your Google Site only needs a short page that links to it.

1. Open your Google Site and add a page for the course.
2. Add the course name and a sentence about what students will do.
3. Under **Insert**, click **Button**. Name it `Open Computing Foundations` and paste the Web app URL as the link.
4. Publish the Site, then click the button to check that it opens the app.

Don't paste the URL into **Embed**, because the app doesn't allow itself to be embedded in other pages. No student information appears on the Site, because the app does its own sign-in and class code check. You can also post the Web app URL in Google Classroom.

## 7. Test it before you teach it

Ask someone to do this with a real student account. If you only have your own account, join with it to check the basics, then use **Blocked** to test being removed.

- [ ] A student can join with their name and class code, and appears in the right class in the **Students** tab.
- [ ] They aren't asked to join again after reloading the page, and can choose Windows or Mac.
- [ ] Ticks stay after reloading the page, and also after signing in on another device.
- [ ] Unticking removes the tick.
- [ ] A wrong class code is refused.
- [ ] Someone marked **Blocked** sees "You can't use this course".
- [ ] One student can't see another student's progress.
- [ ] The student can't open your Sheet.
- [ ] The button on your Google Site opens the app in a student account.
- [ ] Sign in to a personal Google account first, then the school account, and open the app from the button. If this fails, note what happens and see **Common problems**.

## Show progress on the board

The **Dashboard** tab of your Sheet shows a class's progress with bars, and updates by itself as students tick tasks.

1. At the top of the tab, choose a class, or **All classes**.
2. In **Show**, choose the lesson you're teaching, or **All lessons** for the whole course.
3. Choose how to sort it. Sorting by **Name** avoids ranking students in front of the class, and sorting by **Class** keeps each class together.
4. Click **View**, then **Full screen**, so only the Dashboard is on show.

**One lesson** shows a column for each section, green when a student has finished it. The **Whole class** row shows what share of the class has finished each section, so you can see where students are stuck. **Most are up to** names the section most students are working on, and **Extras** shows a star for each extra challenge done.

**All lessons** shows each student's overall progress, with a bar for each lesson.

It shows first names and last initials only. Other tabs in the Sheet hold student emails, so stay on the Dashboard while it's on the board. Blocked students aren't included, extra challenges don't count towards progress, and any lesson marked as optional in `Course.gs` doesn't count towards **Overall**.

You don't need to update the Dashboard when you change a lesson. It catches up the next time a student opens the app. Only adding or removing a whole lesson, or giving a lesson more than 10 sections, needs **setupSheets** to run again.

## Starting a new year

1. Make a copy of your Sheet to keep as an archive, following your school's rules on keeping student data.
2. Clear the rows below the headers in the **Students** and **Progress** tabs.
3. Replace the rows in the **Classes** tab, using new codes.

## Updating the app

If you used the setup script, run `npm run update`. It uploads your changes and keeps the same URL.

Otherwise, paste in the changed files, then click **Deploy**, **Manage deployments**, the pencil icon, choose **New version**, and click **Deploy**. Using **Manage deployments** keeps the same URL, so the button on your Google Site keeps working. **New deployment** would create a different URL.

If an update adds a tab or column to the Sheet, run **setupSheets** again as well. It only adds what's missing and doesn't change student rows.

You can reword lessons and tasks in `Course.gs`, but **never change a task's ID**, such as `L1-APPS-01`. Saved progress depends on those IDs.

## Common problems

| What happens | What to try |
|---|---|
| "The course didn't load", with a message about **setupSheets** | The app has no Sheet yet. Run **setupSheets** in the editor (step 3), then reload. No redeploy is needed. |
| The setup script says the Apps Script API is turned off | Turn it on at [script.google.com/home/usersettings](https://script.google.com/home/usersettings), wait a minute, then run `npm run setup` again. It carries on from where it stopped. |
| Sign-in for the setup script is blocked | Your school may restrict `clasp`. Ask your Google administrator, or use Option B in step 2. |
| "We can't tell who you are" | Check the student is signed in with a school account in your domain, and that **Who has access** is limited to your domain. |
| "That class code didn't work" | Check the code in the **Classes** tab. Capitals and spaces don't matter. |
| A student joined with the wrong name or class | Correct it in the **Students** tab. Students can't change these themselves. |
| A student sees "You can't use this course" | Clear their **Blocked** cell in the **Students** tab. |
| The page loads but ticks won't save, or the app won't load | Often caused by being signed in to several Google accounts at once. Try signing out of the others, or use a separate browser profile. |
| A message says a tab is missing, such as "The Classes tab is missing" | A tab has been renamed or deleted. Run **setupSheets** again, which won't touch your existing data. |
| The app is blank or refuses to load inside a Google Site | It has been embedded. Remove the embed and use a button that links to the Web app URL (step 6). |
