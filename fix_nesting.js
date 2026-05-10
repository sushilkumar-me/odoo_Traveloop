const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    let full = path.join(dir, file);
    if (full.includes('node_modules') || full.includes('.git')) return;
    if (fs.statSync(full).isDirectory()) results = results.concat(walk(full));
    else if (full.endsWith('.tsx')) results.push(full);
  });
  return results;
}

const files = walk('./src');
let fixedCount = 0;

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Regex to match <Link ...> \s* <Button ...> ... </Button> \s* </Link>
  // We need to extract the Link attributes, Button attributes, and inner content
  const regex = /<Link\s([^>]+)>\s*<Button([^>]*)>([\s\S]*?)<\/Button>\s*<\/Link>/g;
  
  content = content.replace(regex, (match, linkAttrs, buttonAttrs, inner) => {
    // Add asChild to Button
    let newButtonAttrs = buttonAttrs;
    if (!newButtonAttrs.includes('asChild')) {
      newButtonAttrs = ' asChild' + newButtonAttrs;
    }
    return `<Button${newButtonAttrs}>\n  <Link ${linkAttrs}>\n    ${inner}\n  </Link>\n</Button>`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
    console.log(`Fixed nesting in ${file}`);
  }
}
console.log(`Fixed ${fixedCount} files`);
