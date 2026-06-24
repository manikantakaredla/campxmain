const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'campx-client', 'src', 'pages'),
  path.join(__dirname, 'campx-client', 'src', 'components')
];

const checkFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for button without onClick or type="submit"
    if (/<button/i.test(line)) {
      // Find full button tag
      let tag = line;
      let j = i;
      while (!/>/.test(tag) && j < lines.length - 1) {
        j++;
        tag += ' ' + lines[j].trim();
      }
      
      // If no onClick, and no type="submit", flag it
      if (!/onClick/i.test(tag) && !/type=["']submit["']/i.test(tag)) {
        issues.push(`Line ${i + 1}: Button without onClick or type="submit" - ${tag.trim()}`);
      }
    }
  }

  return issues;
};

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) { }
  });
  return filelist;
};

let files = [];
srcDirs.forEach(dir => {
  files = files.concat(walkSync(dir));
});

files = files.filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
let totalIssues = 0;

files.forEach(f => {
  const issues = checkFile(f);
  if (issues.length > 0) {
    console.log(`\n--- ${f.replace(__dirname, '')} ---`);
    issues.forEach(i => console.log(i));
    totalIssues += issues.length;
  }
});

console.log(`\nFound ${totalIssues} potential issues.`);
