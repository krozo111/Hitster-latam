const fs = require('fs');
const path = require('path');
const YouTube = require('youtube-sr').default;
const yts = require('yt-search');

// Adds up to 3 fallback video IDs (`alts`) per song so the player can
// switch to another version when the primary won't embed (Error 150/101)
// or is region-blocked. Prefers "- Topic" channels (globally embeddable)
// and official audio/lyric uploads.

function pickAlts(videos, primary, title) {
  const seen = new Set([primary]);
  const out = [];
  const add = (v) => {
    if (v && v.id && !seen.has(v.id)) { seen.add(v.id); out.push(v.id); }
  };
  const base = title.toLowerCase().split('(')[0].trim();
  videos.filter((v) => v.channel?.name?.endsWith('- Topic')).forEach(add);
  videos.filter((v) => /audio|lyric|letra/i.test(v.title || '')).forEach(add);
  videos.filter((v) => (v.title || '').toLowerCase().includes(base)).forEach(add);
  videos.forEach(add);
  return out.slice(0, 3);
}

async function search(query) {
  try {
    const vids = await YouTube.search(query, { limit: 8, type: 'video' });
    if (vids && vids.length) return vids.map((v) => ({ id: v.id, title: v.title, channel: v.channel }));
  } catch (_) { /* fall through to yt-search */ }
  try {
    const r = await yts(query);
    return (r.videos || []).slice(0, 8).map((v) => ({ id: v.videoId, title: v.title, channel: { name: v.author?.name || '' } }));
  } catch (_) {
    return [];
  }
}

async function run() {
  const songsTsPath = path.join(__dirname, 'src', 'lib', 'songs.ts');
  const lines = fs.readFileSync(songsTsPath, 'utf8').split('\n');
  let updated = 0, failed = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ytMatch = line.match(/yt:\s*"([^"]+)"/);
    const titleMatch = line.match(/title:\s*"([^"]+)"/);
    const artistMatch = line.match(/artist:\s*"([^"]+)"/);
    if (!ytMatch || !titleMatch || !artistMatch) continue;
    if (line.includes('alts:')) continue; // already has alts

    const primary = ytMatch[1];
    const title = titleMatch[1];
    const artist = artistMatch[1];

    const videos = await search(`${title} ${artist}`);
    const alts = pickAlts(videos, primary, title);

    if (alts.length) {
      const altsStr = `, alts: [${alts.map((a) => `"${a}"`).join(', ')}]`;
      lines[i] = line.replace(/yt:\s*"([^"]+)"/, `yt: "${primary}"${altsStr}`);
      updated++;
      console.log(`OK  ${title} -> ${alts.length} alts`);
    } else {
      failed++;
      console.log(`!!  ${title}: no alts found`);
    }
    await new Promise((r) => setTimeout(r, 1100));
  }

  fs.writeFileSync(songsTsPath, lines.join('\n'), 'utf8');
  console.log(`\nDone. Updated: ${updated}, Failed: ${failed}`);
}

run();
