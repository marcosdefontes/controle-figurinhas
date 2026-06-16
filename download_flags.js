const fs = require('fs');
const https = require('https');
const path = require('path');

const flagsDir = path.join(__dirname, 'public', 'flags');

// Ensure flags directory exists
if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true });
}

const map = {
  "MEX": "mx", "RSA": "za", "KOR": "kr", "CZE": "cz",
  "CAN": "ca", "BIH": "ba", "QAT": "qa", "SUI": "ch",
  "BRA": "br", "MAR": "ma", "HAI": "ht", "SCO": "gb-sct",
  "USA": "us", "PAR": "py", "AUS": "au", "TUR": "tr",
  "GER": "de", "CUW": "cw", "CIV": "ci", "ECU": "ec",
  "NED": "nl", "JPN": "jp", "SWE": "se", "TUN": "tn",
  "BEL": "be", "EGY": "eg", "IRN": "ir", "NZL": "nz",
  "ESP": "es", "CPV": "cv", "KSA": "sa", "URU": "uy",
  "FRA": "fr", "SEN": "sn", "IRQ": "iq", "NOR": "no",
  "ARG": "ar", "ALG": "dz", "AUT": "at", "JOR": "jo",
  "POR": "pt", "COD": "cd", "UZB": "uz", "COL": "co",
  "ENG": "gb-eng", "CRO": "hr", "GHA": "gh", "PAN": "pa"
};

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {}); // Delete temp file
        reject(`Server responded with ${response.statusCode}: ${url}`);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {}); // Delete temp file
      reject(err.message);
    });
  });
};

async function downloadAll() {
  for (const [fifa, iso] of Object.entries(map)) {
    // We'll download the w40 width PNGs which are perfect for small UI elements
    const url = `https://flagcdn.com/w40/${iso}.png`;
    const dest = path.join(flagsDir, `${fifa}.png`);
    
    try {
      if (!fs.existsSync(dest)) {
        await download(url, dest);
        console.log(`Downloaded ${fifa}.png`);
      } else {
        console.log(`Skipped ${fifa}.png (already exists)`);
      }
    } catch (err) {
      console.error(`Failed to download ${fifa}:`, err);
    }
  }
  console.log('Finished downloading flags!');
}

downloadAll();
