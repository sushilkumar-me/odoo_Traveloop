const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (dirPath.includes('node_modules') || dirPath.includes('.git')) return;
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Replace literal ? that were mistakenly added by encoding errors back to Rupee
        let newContent = content.replace(/\?(\d+)/g, '\u20B9$1');
        // Replace remaining $ followed by anything that is not {
        newContent = newContent.replace(/\$([^\{])/g, '\u20B9$1');
        
        // Also handle the edge case in budget-highlights where it is \`$$
        newContent = newContent.replace(/`\$\$/g, '`\u20B9$');
        newContent = newContent.replace(/`\$\\u20B9/g, '`\u20B9');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
