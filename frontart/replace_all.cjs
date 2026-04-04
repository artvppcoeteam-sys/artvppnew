const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Administrator/Downloads/artvpp-main/artvpp-main/frontart/src/app';

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            processDir(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const original = content;

            content = content.replace(/#D4AF37/gi, '#FF7A18');
            content = content.replace(/#E59E1A/gi, '#FF7A18');
            content = content.replace(/#8B4049/gi, '#FF3CAC');
            content = content.replace(/#C19B2A/gi, '#FF7A18');
            content = content.replace(/#7A3740/gi, '#FF3CAC');

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDir(dir);
