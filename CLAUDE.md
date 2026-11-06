# Computing Foundations

A three-lesson Year 9 course: a Google Apps Script web app, embedded in Google Sites, that saves progress to a private Google Sheet.

**This repository is public.** Never commit:
- student names, emails or rosters (only the made-up `dev/sample-roster.csv`)
- spreadsheet IDs, script IDs or deployment URLs
- anything from `private/`, including the handover and the school's AI policy

Quiz answers and answer keys are fine in the repo. The teacher decided that protecting them isn't a concern. Other teachers may set up their own copy using `docs/setup.md`, so keep school-specific details out of the code and update that guide when setup changes.

Rules:
- Requirements are in `private/reference/PROJECT_CONTEXT.md`. This is a reconstruction, as the original starter was never recovered.
- Task IDs in `src/Course.gs` are permanent. Change a task's wording freely, but never change or reuse its ID, because saved progress depends on it.
- Student identity comes only from `Session.getActiveUser()` on the server. Never accept an identity from the browser.
- `src/Scripts.html` must not contain mock code. Local preview adds its mock in `dev/build-preview.js`.
- Use Australian English and a Year 9 reading level. Keep shared content in one place, with only platform steps differing between Windows and Mac.

Commands:
- `npm test` runs the server tests against a fake Sheet.
- `npm run preview` builds `dev/preview.html`, which runs in a browser with a mock server.
