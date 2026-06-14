// Generates public/yt-test.html — a harness that loads every song's YouTube
// video in the IFrame API and reports which ones fail to embed (Error 101/150).
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'src', 'lib', 'songs.ts'), 'utf8');
const songs = [];
const re = /\{ id:\s*(\d+),\s*title:\s*"([^"]+)",\s*artist:\s*"([^"]+)",\s*year:\s*(\d+),\s*yt:\s*"([^"]*)"/g;
let m;
while ((m = re.exec(content)) !== null) {
  songs.push({ id: +m[1], title: m[2], artist: m[3], year: +m[4], yt: m[5] });
}

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>YT Embed Test</title></head>
<body style="background:#111;color:#eee;font-family:monospace;padding:12px">
<h3 id="status">Loading YT API...</h3>
<div id="slots"></div>
<script>
const SONGS = ${JSON.stringify(songs)};
const CONCURRENCY = 8;
const TIMEOUT_MS = 7000;
window.__done = false;
window.__results = [];
let idx = 0, completed = 0;

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);

function record(song, status, code) {
  window.__results.push({ id: song.id, title: song.title, yt: song.yt, status, code: code ?? null });
  completed++;
  document.getElementById('status').textContent =
    'Tested ' + completed + '/' + SONGS.length + ' | OK:' +
    window.__results.filter(r=>r.status==='ok').length +
    ' FAIL:' + window.__results.filter(r=>r.status!=='ok').length;
  if (completed === SONGS.length) {
    window.__done = true;
    document.getElementById('status').textContent += '  ===DONE===';
  }
}

function testNext(slotEl) {
  if (idx >= SONGS.length) return;
  const song = SONGS[idx++];
  const holder = document.createElement('div');
  slotEl.innerHTML = '';
  slotEl.appendChild(holder);
  let settled = false;
  const finish = (status, code) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    try { player.destroy(); } catch(e){}
    record(song, status, code);
    testNext(slotEl);
  };
  const timer = setTimeout(() => finish('timeout'), TIMEOUT_MS);
  const player = new YT.Player(holder, {
    height: '90', width: '120', videoId: song.yt,
    playerVars: { autoplay: 0, controls: 0 },
    events: {
      onReady: () => finish('ok'),
      onError: (e) => finish('error', e.data),
    },
  });
}

window.onYouTubeIframeAPIReady = function() {
  document.getElementById('status').textContent = 'Testing...';
  const slots = document.getElementById('slots');
  for (let i = 0; i < CONCURRENCY; i++) {
    const s = document.createElement('span');
    s.style.cssText = 'display:inline-block;width:120px;height:90px;margin:2px;overflow:hidden';
    slots.appendChild(s);
    testNext(s);
  }
};
</script>
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'public', 'yt-test.html'), html, 'utf8');
console.log(`Wrote public/yt-test.html with ${songs.length} songs.`);
