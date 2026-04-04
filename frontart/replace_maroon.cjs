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

            // Replace common gradients with solid maroon button style
            content = content.replace(/bg-gradient-to-r from-\[\#FF3CAC\] to-\[\#FF7A18\] text-white rounded-\[10px\] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0/g, 'bg-[#8B3A3A] hover:bg-[#7A2F2F] text-white rounded-[10px] shadow-sm hover:shadow-md transition-all duration-250');
            content = content.replace(/bg-gradient-to-r from-\[\#FF3CAC\] to-\[\#FF7A18\]/g, 'bg-[#8B3A3A] hover:bg-[#7A2F2F]');
            content = content.replace(/bg-\[\#FF7A18\]/g, 'bg-[#8B3A3A]');
            content = content.replace(/bg-\[\#FF3CAC\]/g, 'bg-[#8B3A3A]');
            content = content.replace(/bg-\[\#D4AF37\]/g, 'bg-[#8B3A3A]'); // catch any missed old gold

            content = content.replace(/text-\[\#FF7A18\]/g, 'text-[#8B3A3A]');
            content = content.replace(/text-\[\#FF3CAC\]/g, 'text-[#8B3A3A]');
            content = content.replace(/text-\[\#D4AF37\]/g, 'text-[#8B3A3A]');

            content = content.replace(/hover:text-\[\#FF7A18\]/g, 'hover:text-[#7A2F2F]');
            content = content.replace(/hover:text-\[\#FF3CAC\]/g, 'hover:text-[#7A2F2F]');
            content = content.replace(/hover:bg-\[\#FF7A18\]/g, 'hover:bg-[#7A2F2F]');
            content = content.replace(/hover:bg-\[\#FF3CAC\]/g, 'hover:bg-[#7A2F2F]');

            content = content.replace(/border-\[\#FF7A18\]/g, 'border-[#8B3A3A]');
            content = content.replace(/border-\[\#FF3CAC\]/g, 'border-[#8B3A3A]');
            content = content.replace(/border-l-\[\#FF7A18\]/g, 'border-l-[#8B3A3A]');

            content = content.replace(/fill-\[\#FF7A18\]/g, 'fill-[#8B3A3A]');
            content = content.replace(/fill-\[\#FF3CAC\]/g, 'fill-[#8B3A3A]');

            content = content.replace(/stroke="#FF7A18"/g, 'stroke="#8B3A3A"');
            content = content.replace(/stroke="#FF3CAC"/g, 'stroke="#8B3A3A"');
            content = content.replace(/fill="#FF7A18"/g, 'fill="#8B3A3A"');
            content = content.replace(/fill="#FF3CAC"/g, 'fill="#8B3A3A"');

            content = content.replace(/stopColor="#FF7A18"/g, 'stopColor="#8B3A3A"');
            content = content.replace(/stopColor="#FF3CAC"/g, 'stopColor="#8B3A3A"');

            content = content.replace(/#FF7A18/gi, '#8B3A3A');
            content = content.replace(/#FF3CAC/gi, '#8B3A3A');

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDir(dir);
