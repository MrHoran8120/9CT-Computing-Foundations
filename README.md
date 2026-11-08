# Computing Foundations

An interactive introductory computing course for Year 9 students, with four core lessons and one optional lesson, each 75 minutes. Together they make the **Foundations** unit:

1. **Computer fundamentals:** files, folders, paths, file extensions, and local and cloud storage.
2. **Taking control of your files:** selecting several files, saving on purpose, telling versions apart, and finding missing work.
3. **ZIP files and submission:** packaging, extracting, repairing and handing in a complete project.
4. **AI and assessment:** AI permission levels, explaining your own work, and acknowledging AI use.
5. **Your coding toolkit (optional):** installing VS Code, working in a project folder and using the terminal.

Each lesson also has at least one extra challenge for students who finish early.

Students work through one web app, choosing Windows or Mac instructions, and can search the whole course to find where something was taught. Their progress saves to a private Google Sheet that the teacher uses as a dashboard.

**Status:** in development. The app foundation is in place and lesson content is still being written. It hasn't been deployed or tested with real student accounts yet.

This is a new implementation written from the course requirements. It's a reconstruction of an earlier prototype whose source was never recovered, and it contains none of that prototype's code.

## How it works

```text
Google Site (link) → Apps Script web app (own browser tab) → private Google Sheet
```

- The Google Site is a short landing page with a button that opens the app.
- Students sign in with their school Google account. On their first visit, they join by entering their name and a class code, and the teacher can block anyone who shouldn't be there.
- The server works out who a student is from the Google session and never trusts an identity sent by the browser.
- Students can only read and change their own progress. They never get access to the Sheet.

## Working on it

You'll need [Node.js](https://nodejs.org) 20 or later. There are no packages to install, although `npm run setup` and `npm run update` download Google's `clasp` tool when they run.

```text
npm test           Run the tests against a fake Sheet and a fake clasp
npm run preview    Build dev/preview.html, which runs in a browser with a mock server
npm run exercise-files    Rebuild the files students download
npm run setup      Create and deploy your own copy (see docs/setup.md)
npm run update     Upload changes to your copy, keeping the same URL
```

The preview is for checking layout and behaviour. It doesn't test Google sign-in or the real Sheet, so those need a real deployment.

## Folders

| Folder | Contains |
|---|---|
| `src/` | The Apps Script app |
| `test/` | Server and setup script tests |
| `dev/` | Setup script and local preview tooling |
| `docs/` | Teacher guides |
| `exercise-files/` | Copies of the files students download during the lessons |

## Using this with your own classes

Any teacher with a school Google Workspace account can run their own copy, with their own classes and private Sheet. See [docs/setup.md](docs/setup.md).

## What isn't in this repository

This repository is public, so student data and spreadsheet and deployment IDs are kept out of it on purpose. Each teacher's class codes, student details and progress stay in their own Sheet.

## Licence

The code is under the [MIT licence](LICENSE). The course content is under [CC BY 4.0](LICENSE-CONTENT.md), so you're welcome to reuse and adapt it with credit.
