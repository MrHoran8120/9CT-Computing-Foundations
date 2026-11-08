# Computing Foundations

A Year 9 course, the Foundations unit, of five core lessons: a Google Apps Script web app that opens in its own tab from a link on a Google Site and saves progress to a private Google Sheet. The app must not be embedded in the Site.

**This repository is public.** Never commit:
- student names, emails, rosters or real class codes
- spreadsheet IDs, script IDs or deployment URLs
- anything from `private/`, including the handover and the school's AI policy

Quiz answers and answer keys are fine in the repo. The teacher decided that protecting them isn't a concern. Other teachers may set up their own copy using `docs/setup.md`, so keep school-specific details out of the code and update that guide when setup changes.

Rules:
- Requirements are in `private/reference/PROJECT_CONTEXT.md`. This is a reconstruction, as the original starter was never recovered.
- Task IDs in `src/Course.gs` are permanent. Change a task's wording freely, but never change or reuse its ID, because saved progress depends on it.
- Student identity comes only from `Session.getActiveUser()` on the server. Never accept an identity from the browser. A class code only decides whether someone can join and which class they're in.
- Lesson content is in `src/Lesson1.gs` and similar files, keyed by each section's first task ID. Files are named by lesson ID, not by position: students see lessons in `COURSE` order, so `L5` (`src/Lesson5.gs`) is shown second and `L4` third. Retired task IDs are listed in `RETIRED_IDS`. Place a `{ type: 'tick', task: '<ID>' }` checkpoint straight after the activity each task belongs to. In a section with more than one task, place all of them; a section with one task can leave it to appear at the bottom. A new lesson gets the next unused ID and a `unit`. More units are expected later, such as Git and GitHub, and the terminal.
- `src/Scripts.html` must not contain mock code. Local preview adds its mock in `dev/build-preview.js`.
- Use Australian English and a Year 9 reading level. Keep shared content in one place, with only platform steps differing between Windows and Mac.

Commands:
- `npm test` runs the tests against a fake Sheet and a fake clasp.
- `npm run preview` builds `dev/preview.html`, which runs in a browser with a mock server.
- `npm run exercise-files` rebuilds `src/ExerciseFiles.gs` and `exercise-files/`. Don't edit `src/ExerciseFiles.gs` by hand.
- `npm run setup` creates and deploys a teacher's own copy with clasp, and `npm run update` uploads changes and keeps the same URL. Only run these when the teacher asks, because they change their real Google project.
