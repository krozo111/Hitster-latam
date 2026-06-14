const fs = require('fs');
const path = require('path');
const YouTube = require('youtube-sr').default;

// Only fetches YouTube IDs for songs with an empty `yt: ""`.
// Curated IDs (Topic channels, hand-picked) are left untouched.
// Prefers "- Topic" channels and official audio/lyric videos, which
// reliably allow embedding (avoids Error 150 / VEVO embed blocks).

function pickBest(videos, title) {
  if (!videos || videos.length === 0) return null;
  const t = title.toLowerCase();

  // 1. "- Topic" auto-generated YouTube Music channels (always embeddable)
  const topic = videos.find((v) => v.channel?.name?.endsWith('- Topic'));
  if (topic) return topic;

  // 2. Official audio / lyric videos
  const audio = videos.find((v) => {
    const vt = (v.title || '').toLowerCase();
    return vt.includes('audio') || vt.includes('lyric') || vt.includes('letra');
  });
  if (audio) return audio;

  // 3. First result that actually mentions the song title
  const titled = videos.find((v) => (v.title || '').toLowerCase().includes(t.split('(')[0].trim()));
  if (titled) return titled;

  // 4. Fallback: first result
  return videos[0];
}

async function run() {
  const songsTsPath = path.join(__dirname, 'src', 'lib', 'songs.ts');
  let content = fs.readFileSync(songsTsPath, 'utf8');

  const lines = content.split('\n');
  const results = { filled: [], failed: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('yt: ""')) continue;

    const titleMatch = line.match(/title:\s*"([^"]+)"/);
    const artistMatch = line.match(/artist:\s*"([^"]+)"/);
    if (!titleMatch || !artistMatch) continue;

    const title = titleMatch[1];
    const artist = artistMatch[1];
    const query = `${title} ${artist} audio`;

    try {
      const videos = await YouTube.search(query, { limit: 6, type: 'video' });
      const best = pickBest(videos, title);
      if (best && best.id) {
        const tag = best.channel?.name?.endsWith('- Topic') ? 'Topic' : 'video';
        lines[i] = line.replace('yt: ""', `yt: "${best.id}"`) + ` // ${tag} (auto)`;
        results.filled.push(`${title} -> ${best.id} [${tag}]`);
        console.log(`OK  ${title} -> ${best.id} [${tag}]`);
      } else {
        results.failed.push(query);
        console.log(`!!  No result: ${query}`);
      }
    } catch (err) {
      results.failed.push(`${query} (${err.message})`);
      console.log(`ERR ${query}: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 1200));
  }

  fs.writeFileSync(songsTsPath, lines.join('\n'), 'utf8');
  console.log(`\nDone. Filled: ${results.filled.length}, Failed: ${results.failed.length}`);
  if (results.failed.length) console.log('Failed queries:\n' + results.failed.join('\n'));
}

run();
