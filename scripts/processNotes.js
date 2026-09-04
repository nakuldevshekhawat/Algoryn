import fs from 'fs';
import path from 'path';

// --- Utilities ---
function removeNumberPrefix(name) {
  return name.replace(/^(\d+\.)?\d+[\.\s]*/, '').trim();
}

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (filePath.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// --- Process DSA ---
function processDSA() {
  console.log('\n--- Processing DSA Notes ---');
  const dsaData = JSON.parse(fs.readFileSync('./src/data/interviewX/interviewx-dsa.json', 'utf-8'));
  const dsaNotesDir = './public/interviewx-notes/dsa';
  const htmlFiles = findHtmlFiles(dsaNotesDir);

  const matchedNotes = {}; 
  const unmatchedNotes = [];
  
  const videoLocations = dsaData.videos.map(v => {
    const locationMatch = v.title.match(/Location:\s*(.*?)(?=\s*(?:Follow Now:|Now:|Downloaded By|$))/i);
    const loc = locationMatch ? locationMatch[1].trim() : '';
    const normLoc = normalizeTitle(loc);
    return { ...v, normLoc, loc };
  });

  for (const htmlFile of htmlFiles) {
    const match = htmlFile.match(/DSA\/(.*)\/index\.html$/);
    if (!match) {
      unmatchedNotes.push({ path: htmlFile, reason: 'Not in expected folder structure' });
      continue;
    }
    const relPath = match[1]; 
    const normRelPath = normalizeTitle(relPath);

    const matchedVideo = videoLocations.find(v => v.normLoc === normRelPath);
    const publicPath = '/' + path.relative('./public', htmlFile).replace(/\\/g, '/');

    if (matchedVideo) {
      matchedNotes[matchedVideo.id] = { path: publicPath, cleanTitle: removeNumberPrefix(path.basename(relPath)) };
    } else {
      unmatchedNotes.push({ path: publicPath, relPath, cleanTitle: removeNumberPrefix(path.basename(relPath)) });
    }
  }

  console.log(`Total HTML files: ${htmlFiles.length}`);
  console.log(`Matched notes: ${Object.keys(matchedNotes).length}`);
  console.log(`Unmatched notes: ${unmatchedNotes.length}`);
  
  fs.writeFileSync('./src/data/interviewXNotes/dsaNotes.json', JSON.stringify({ matchedNotes, unmatchedNotes }, null, 2));
}

// --- Process OS ---
function processOS() {
  console.log('\n--- Processing OS Notes ---');
  const osData = JSON.parse(fs.readFileSync('./src/data/interviewX/interviewx-os.json', 'utf-8'));
  const osNotesDir = './public/interviewx-notes/os';
  const htmlFiles = findHtmlFiles(osNotesDir);

  const matchedNotes = {}; 
  const unmatchedNotes = [];
  
  const videoLocations = osData.videos.map(v => {
    const locationMatch = v.title.match(/Location:\s*(.*?)(?=\s*(?:Follow Now:|Now:|Downloaded By|$))/i);
    const loc = locationMatch ? locationMatch[1].trim() : '';
    const normLoc = normalizeTitle(loc);
    return { ...v, normLoc, loc };
  });

  for (const htmlFile of htmlFiles) {
    const match = htmlFile.match(/OPERATING-SYSTEM\/(.*)\/index\.html$/);
    if (!match) {
      unmatchedNotes.push({ path: htmlFile, reason: 'Not in expected folder structure' });
      continue;
    }
    const relPath = match[1]; 
    const normRelPath = normalizeTitle(relPath);

    const matchedVideo = videoLocations.find(v => v.normLoc === normRelPath);
    const publicPath = '/' + path.relative('./public', htmlFile).replace(/\\/g, '/');

    if (matchedVideo) {
      matchedNotes[matchedVideo.id] = { path: publicPath, cleanTitle: removeNumberPrefix(path.basename(relPath)) };
    } else {
      unmatchedNotes.push({ path: publicPath, relPath, cleanTitle: removeNumberPrefix(path.basename(relPath)) });
    }
  }

  console.log(`Total HTML files: ${htmlFiles.length}`);
  console.log(`Matched notes: ${Object.keys(matchedNotes).length}`);
  console.log(`Unmatched notes: ${unmatchedNotes.length}`);
  
  fs.writeFileSync('./src/data/interviewXNotes/osNotes.json', JSON.stringify({ matchedNotes, unmatchedNotes }, null, 2));
}

// --- Process DBMS ---
function processDBMS() {
  console.log('\n--- Processing DBMS Notes ---');
  const dbmsData = JSON.parse(fs.readFileSync('./src/data/interviewX/interviewx-dbms.json', 'utf-8'));
  const dbmsNotesDir = './public/interviewx-notes/dbms';
  const htmlFiles = findHtmlFiles(dbmsNotesDir);

  const matchedNotes = {};
  const unmatchedNotes = [];

  const videos = dbmsData.videos.map(v => {
    let cleanName = v.title;
    const fnMatch = v.title.match(/(?:File Name:|File:)\s*(.*?)(?=\s*(?:Location:|Follow Now:|Now:|Downloaded By|$))/i);
    if (fnMatch) {
      cleanName = fnMatch[1].trim();
    }
    cleanName = removeNumberPrefix(cleanName);
    return { ...v, cleanName, normTitle: normalizeTitle(cleanName) };
  });

  for (const htmlFile of htmlFiles) {
    const filename = path.basename(htmlFile, '.html');
    const cleanTitle = removeNumberPrefix(filename);
    const normNoteTitle = normalizeTitle(cleanTitle);

    let matchedVideo = videos.find(v => v.normTitle === normNoteTitle);
    
    if (!matchedVideo) {
      matchedVideo = videos.find(v => v.normTitle.includes(normNoteTitle) || normNoteTitle.includes(v.normTitle));
    }

    const publicPath = '/' + path.relative('./public', htmlFile).replace(/\\/g, '/');

    if (matchedVideo) {
      matchedNotes[matchedVideo.id] = { path: publicPath, cleanTitle };
    } else {
      unmatchedNotes.push({ path: publicPath, cleanTitle, originalFilename: filename });
    }
  }

  console.log(`Total HTML files: ${htmlFiles.length}`);
  console.log(`Matched notes: ${Object.keys(matchedNotes).length}`);
  console.log(`Unmatched notes: ${unmatchedNotes.length}`);

  fs.writeFileSync('./src/data/interviewXNotes/dbmsNotes.json', JSON.stringify({ matchedNotes, unmatchedNotes }, null, 2));
}

// --- Process CN ---
function processCN() {
  console.log('\n--- Processing CN Notes ---');
  const cnData = JSON.parse(fs.readFileSync('./src/data/interviewX/interviewx-cn.json', 'utf-8'));
  const cnNotesDir = './public/interviewx-notes/cn';
  const htmlFiles = findHtmlFiles(cnNotesDir);

  const matchedNotes = {};
  const unmatchedNotes = [];

  const videos = cnData.videos.map(v => {
    let cleanName = v.title;
    const fnMatch = v.title.match(/(?:File Name:|File:)\s*(.*?)(?=\s*(?:Location:|Follow Now:|Now:|Downloaded By|$))/i);
    if (fnMatch) {
      cleanName = fnMatch[1].trim();
    }
    cleanName = removeNumberPrefix(cleanName);
    const noBracketName = cleanName.replace(/\s*\(.*\)\s*$/, '').trim();
    return { ...v, cleanName, noBracketName, normTitle: normalizeTitle(noBracketName) };
  });

  for (const htmlFile of htmlFiles) {
    const content = fs.readFileSync(htmlFile, 'utf-8');
    const urlMatch = content.match(/url:\s*(https?:\/\/[^\s]+)/i);
    
    let cleanTitle = 'Unknown Topic';
    if (urlMatch) {
      const urlStr = urlMatch[1];
      try {
        const urlObj = new URL(urlStr);
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1]; 
          cleanTitle = lastPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      } catch (e) {}
    } else {
       const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
       if (h1Match) {
           cleanTitle = h1Match[1].replace(/<[^>]+>/g, '').trim();
       } else {
           const titleMatch = content.match(/<title>(.*?)<\/title>/i);
           if (titleMatch) {
               cleanTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
               if (cleanTitle.includes('takeuforward')) cleanTitle = 'Unknown Topic';
           }
       }
    }

    const normNoteTitle = normalizeTitle(cleanTitle);

    let matchedVideo = videos.find(v => v.normTitle === normNoteTitle);
    
    if (!matchedVideo) {
       matchedVideo = videos.find(v => v.normTitle.includes(normNoteTitle) || normNoteTitle.includes(v.normTitle));
    }

    const publicPath = '/' + path.relative('./public', htmlFile).replace(/\\/g, '/');

    if (matchedVideo) {
      matchedNotes[matchedVideo.id] = { path: publicPath, cleanTitle };
    } else {
      unmatchedNotes.push({ path: publicPath, cleanTitle, urlFound: !!urlMatch });
    }
  }

  console.log(`Total HTML files: ${htmlFiles.length}`);
  console.log(`Matched notes: ${Object.keys(matchedNotes).length}`);
  console.log(`Unmatched notes: ${unmatchedNotes.length}`);

  fs.writeFileSync('./src/data/interviewXNotes/cnNotes.json', JSON.stringify({ matchedNotes, unmatchedNotes }, null, 2));
}

if (!fs.existsSync('./src/data/interviewXNotes')) {
  fs.mkdirSync('./src/data/interviewXNotes', { recursive: true });
}

processDSA();
processOS();
processDBMS();
processCN();
