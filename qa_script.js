const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'campx-client', 'src', 'pages');

const checkFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for empty onClick
    if (/onClick=\{\s*\}/.test(line) || /onClick=""/.test(line)) {
      issues.push(`Line ${i + 1}: Empty onClick handler - ${line.trim()}`);
    }

    // Check for undefined variables in JSX (heuristic: undefined or null rendered)
    // Actually, maybe look for things like onClick={handleSubmit} where handleSubmit is not defined? Hard with regex.

    // Check for Link without to
    if (/<Link[^>]*>/.test(line) && !/to=/.test(line)) {
      issues.push(`Line ${i + 1}: Link without 'to' prop - ${line.trim()}`);
    }

    // Check for obvious console.logs or TODOs that might indicate unfinished work
    if (/TODO:/i.test(line) || /FIXME:/i.test(line)) {
      issues.push(`Line ${i + 1}: Unfinished work comment - ${line.trim()}`);
    }
  }

  return issues;
};

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') console.log(`Cannot access ${dirFile}`);
    }
  });
  return filelist;
};

const files = walkSync(srcDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
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
