const fs = require('fs');
const YouTube = require('youtube-sr').default;
const path = require('path');

// Extract the songs array from songs.ts, update yt ids, and write back.
async function updateSongs() {
  const songsTsPath = path.join(__dirname, 'src', 'lib', 'songs.ts');
  let content = fs.readFileSync(songsTsPath, 'utf8');

  // We will parse the SONGS array, do the search, and then reconstruct it.
  const match = content.match(/export const SONGS: Song\[\] = \[([\s\S]*?)\];/);
  if (!match) {
    console.log("Could not find SONGS array in songs.ts");
    return;
  }

  const songsContent = match[1];
  const songLines = songsContent.split('\n').filter(l => l.includes('{ id:'));
  console.log(`Found ${songLines.length} songs to process.`);
  
  let updatedSongsText = 'export const SONGS: Song[] = [\n';
  
  for (let line of songLines) {
    // Parse title, artist, id, year.
    const titleMatch = line.match(/title:\s*"([^"]+)"/);
    const artistMatch = line.match(/artist:\s*"([^"]+)"/);
    const ytMatch = line.match(/yt:\s*"([^"]+)"/);
    
    if (titleMatch && artistMatch && ytMatch) {
      const title = titleMatch[1];
      const artist = artistMatch[1];
      const oldYt = ytMatch[1];
      
      const query = `${title} ${artist}`;
      console.log(`Searching for: ${query}`);
      
      try {
        const video = await YouTube.searchOne(query);
        if (video && video.id) {
          console.log(`Found ID: ${video.id} for ${query}`);
          const updatedLine = line.replace(/yt:\s*"([^"]+)"/, `yt: "${video.id}"`);
          updatedSongsText += updatedLine + '\n';
        } else {
          console.log(`No results for ${query}, keeping old id.`);
          updatedSongsText += line + '\n';
        }
      } catch (err) {
        console.error(`Error searching ${query}:`, err.message);
        updatedSongsText += line + '\n';
      }
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      updatedSongsText += line + '\n';
    }
  }
  
  updatedSongsText += '];\n';
  
  content = content.replace(/export const SONGS: Song\[\] = \[([\s\S]*?)\];/, updatedSongsText);
  fs.writeFileSync(songsTsPath, content, 'utf8');
  console.log('Finished updating songs.ts');
}

updateSongs();
