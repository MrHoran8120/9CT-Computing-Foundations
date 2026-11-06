// Builds dev/preview.html: the real app files plus a mock server, so the app can run in a browser.
// It doesn't test Google sign-in or the real Sheet. Those need a real deployment.
//
// Add one of these to the file's address to try other situations:
//   #not-on-roster   #no-identity   #save-fails   #new-student
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = path.join(__dirname, '..', 'src');
const read = (name) => fs.readFileSync(path.join(src, name), 'utf8');

const sandbox = {};
vm.runInNewContext(read('Course.gs'), sandbox);
const course = JSON.stringify(sandbox.COURSE);

const mock = `<script>
  (function () {
    var scene = location.hash.slice(1);
    var os = scene === 'new-student' ? null : 'win';
    var saved = scene === 'new-student' ? {} : { 'L1-APPS-01': true, 'L1-NAV-01': true };
    var server = {
      getBootstrap: function () {
        if (scene === 'not-on-roster') return { status: 'not_on_roster' };
        if (scene === 'no-identity') return { status: 'no_identity' };
        return { status: 'ok', student: { name: 'Student 01', className: 'Class A', os: os }, course: ${course}, progress: saved };
      },
      setOs: function (value) { if (scene === 'save-fails') throw new Error('Mock failure'); os = value; return { os: value }; },
      setTask: function (id, done) { if (scene === 'save-fails') throw new Error('Mock failure'); return { taskId: id, done: done }; }
    };
    function runner(ok, fail) {
      var r = {
        withSuccessHandler: function (f) { return runner(f, fail); },
        withFailureHandler: function (f) { return runner(ok, f); }
      };
      Object.keys(server).forEach(function (name) {
        r[name] = function () {
          var args = arguments;
          setTimeout(function () {
            try { var out = server[name].apply(null, args); ok(out); } catch (e) { fail(e); }
          }, 150);
        };
      });
      return r;
    }
    window.google = { script: { run: runner() } };
  })();
</script>`;

const html = read('Index.html')
  .replace("<?!= include('Styles'); ?>", () => read('Styles.html'))
  .replace("<?!= include('Scripts'); ?>", () => mock + read('Scripts.html'));

const out = path.join(__dirname, 'preview.html');
fs.writeFileSync(out, html);
console.log('Built ' + out);
