# Set up your own copy

This guide is for any teacher who wants to run Computing Foundations with their own classes. Your copy has its own class list and its own private Google Sheet, and it's completely separate from anyone else's. It takes about 20 minutes.

> **Draft:** these steps haven't been tested on a live deployment yet, so some menu names may differ. This note will be removed after the first deployment test.

## What you need

- A **school Google Workspace account**. A personal Gmail account won't work, because the app needs your school's Google domain to identify students.
- Students with accounts in the **same domain** as yours.
- Your school's approval to store student names and email addresses in your Google Sheet, if your school requires it.
- Permission to run Apps Script web apps. Some schools restrict this, so ask your Google administrator if you get stuck at step 4.

## 1. Get the files

On this project's GitHub page, click **Code**, then **Download ZIP**. Extract it. You'll need the files in the `src` folder.

## 2. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com), signed in with your school account.
2. Click **New project** and name it `Computing Foundations`.
3. Click **Project Settings** (the gear icon) and tick **Show "appsscript.json" manifest file in editor**.
4. Back in the **Editor**, add each file below and paste in the contents of the matching file from `src`.

| In the editor | Type | Paste from |
|---|---|---|
| `appsscript` | Already there | `src/appsscript.json` |
| `Code` | Already there | `src/Code.gs` |
| `Course` | Script | `src/Course.gs` |
| `Index` | HTML | `src/Index.html` |
| `Styles` | HTML | `src/Styles.html` |
| `Scripts` | HTML | `src/Scripts.html` |

Names must match exactly, including capitals. The editor adds the file endings itself.

5. Click **Save**.

If you're comfortable with a command line, you can use Google's [clasp](https://github.com/google/clasp) tool instead of pasting. Set `rootDir` to `src` in your `.clasp.json`.

## 3. Create your Sheet

1. Open the `Code` file. In the function menu at the top, choose **setupSheets**, then click **Run**.
2. Google asks for permission the first time. Review it and allow it. The app only needs your spreadsheets and your email address.
3. The **Execution log** shows a link to your new Sheet, called **Computing Foundations progress**. It's also in your Google Drive.

Keep this Sheet private and don't share it with students. They use the app, and never need access to the Sheet.

## 4. Deploy the app

1. Click **Deploy**, then **New deployment**.
2. Click the gear icon and choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone within** your school's domain.
5. Click **Deploy** and copy the **Web app** URL.

Both settings matter. "Execute as Me" lets the app save to your Sheet without students having access to it, and limiting access to your domain lets the app identify each student.

## 5. Add your classes

In the **Roster** tab of your Sheet, add one row per student, starting at row 2:

| Email | Name | Class |
|---|---|---|
| A student's school email address | Their name | Their class |

Paste the rows in with the existing headers left in place. Roster changes take effect straight away, with no need to redeploy.

## 6. Add it to Google Sites

1. Open your Google Site and click **Embed** under **Insert**.
2. Paste the Web app URL and click **Insert**.
3. Drag the box to make it large, then publish the Site.

## 7. Test it before you teach it

Ask someone to do this with a real student account. If you only have your own account, add yourself to the Roster to check the basics.

- [ ] A student on the Roster can sign in and choose Windows or Mac.
- [ ] Ticks stay after reloading the page, and also after signing in on another device.
- [ ] Unticking removes the tick.
- [ ] Someone not on the Roster sees "You're not on the class list yet".
- [ ] One student can't see another student's progress.
- [ ] The student can't open your Sheet.
- [ ] All of this also works in the Google Site, not just at the Web app URL.

## Starting a new year

1. Make a copy of your Sheet to keep as an archive, following your school's rules on keeping student data.
2. Clear the rows below the headers in the **Students** and **Progress** tabs.
3. Replace the rows in the **Roster** tab.

## Updating the app

Paste in the changed files, then click **Deploy**, **Manage deployments**, the pencil icon, choose **New version**, and click **Deploy**. Using **Manage deployments** keeps the same URL, so your Google Site keeps working. **New deployment** would create a different URL.

You can reword lessons and tasks in `Course.gs`, but **never change a task's ID**, such as `L1-APPS-01`. Saved progress depends on those IDs.

## Common problems

| What happens | What to try |
|---|---|
| "We can't tell who you are" | Check the student is signed in with a school account in your domain, and that **Who has access** is limited to your domain. |
| "You're not on the class list yet" | Check the Roster email exactly matches the account they're signed in with. Capitals and stray spaces don't matter. |
| The page loads but ticks won't save, or the app won't load | Often caused by being signed in to several Google accounts at once. Try signing out of the others, or use a separate browser profile. |
| "The Roster tab is missing" | A tab has been renamed or deleted. Run **setupSheets** again, which won't touch your existing data. |
| The box in Google Sites is blank or asks for permission | Open the Web app URL directly once, then reload the Site. If it's still blocked, ask your Google administrator. |
