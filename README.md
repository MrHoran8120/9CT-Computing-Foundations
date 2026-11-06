# Computing Foundations

An interactive introductory computing course for Year 9 students, covering three 75-minute lessons:

1. **Computer fundamentals:** files, folders, paths, file extensions, and local and cloud storage.
2. **ZIP files and submission:** packaging, extracting, repairing and handing in a complete project.
3. **AI and assessment:** AI permission levels, explaining your own work, and acknowledging AI use.

Students work through one web app, choosing Windows or Mac instructions. Their progress saves to a private Google Sheet that the teacher uses as a dashboard.

**Status:** in development. The app foundation is in place and lesson content is still being written. It hasn't been deployed or tested with real student accounts yet.

This is a new implementation written from the course requirements. It's a reconstruction of an earlier prototype whose source was never recovered, and it contains none of that prototype's code.

## How it works

```text
Google Site → Apps Script web app → private Google Sheet
```

- Students sign in with their school Google account, and the server checks them against a roster in the Sheet.
- The server works out who a student is from the Google session and never trusts an identity sent by the browser.
- Students can only read and change their own progress. They never get access to the Sheet.

## Working on it

You'll need [Node.js](https://nodejs.org) 18 or later. There are no packages to install.

```text
npm test           Run the server tests against a fake Sheet
npm run preview    Build dev/preview.html, which runs in a browser with a mock server
```

The preview is for checking layout and behaviour. It doesn't test Google sign-in or the real Sheet, so those need a real deployment.

## Folders

| Folder | Contains |
|---|---|
| `src/` | The Apps Script app |
| `test/` | Server tests |
| `dev/` | Local preview tooling and a made-up sample roster |
| `docs/` | Teacher guides |
| `exercise-files/` | Files students download during the lessons |

## Using this with your own classes

Any teacher with a school Google Workspace account can run their own copy, with their own roster and private Sheet. See [docs/setup.md](docs/setup.md).

## What isn't in this repository

This repository is public, so student data and spreadsheet and deployment IDs are kept out of it on purpose. Each teacher's roster and progress stay in their own Sheet.

## Licence

The code is under the [MIT licence](LICENSE). The course content is under [CC BY 4.0](LICENSE-CONTENT.md), so you're welcome to reuse and adapt it with credit.
