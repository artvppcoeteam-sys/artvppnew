const fs = require('fs');
const path = require('path');

const dirs = [
    'c:/Users/Administrator/Downloads/artvpp-main/artvpp-main/frontart/src/app/components/pages',
    'c:/Users/Administrator/Downloads/artvpp-main/artvpp-main/frontart/src/app/components/layouts',
    'c:/Users/Administrator/Downloads/artvpp-main/artvpp-main/frontart/src/app/components'
];

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'ui' && entry.name !== 'modals') {
                processDir(fullPath);
            }
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const original = content;

            content = content.replace(/text-\[\#D4AF37\]/g, 'text-[#FF7A18]');
            content = content.replace(/text-\[\#E59E1A\]/g, 'text-[#FF7A18]');
            content = content.replace(/text-\[\#8B4049\]/g, 'text-[#FF3CAC]');

            content = content.replace(/hover:text-\[\#D4AF37\]/g, 'hover:text-[#FF7A18]');
            content = content.replace(/hover:text-\[\#E59E1A\]/g, 'hover:text-[#FF7A18]');

            content = content.replace(/fill-\[\#D4AF37\]/g, 'fill-[#FF7A18]');
            content = content.replace(/border-\[\#D4AF37\]/g, 'border-[#FF7A18]');
            content = content.replace(/border-l-\[\#D4AF37\]/g, 'border-l-[#FF7A18]');

            content = content.replace(/from-\[\#D4AF37\]/g, 'from-[#FF3CAC]');
            content = content.replace(/to-\[\#8B4049\]/g, 'to-[#FF7A18]');
            content = content.replace(/from-\[\#8B4049\]/g, 'from-[#FF7A18]');
            content = content.replace(/to-\[\#D4AF37\]/g, 'to-[#FF3CAC]');

            content = content.replace(/bg-\[\#D4AF37\]\/([0-9]+)/g, 'bg-[#FF7A18]/$1');
            content = content.replace(/bg-\[\#E59E1A\]\/([0-9]+)/g, 'bg-[#FF7A18]/$1');
            content = content.replace(/bg-\[\#8B4049\]\/([0-9]+)/g, 'bg-[#FF3CAC]/$1');

            content = content.replace(/bg-\[\#D4AF37\] hover:bg-\[\#C19B2A\]/g, 'bg-gradient-to-r from-[#FF3CAC] to-[#FF7A18] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0');
            content = content.replace(/bg-\[\#E59E1A\] hover:bg-\[\#d08e17\]/g, 'bg-gradient-to-r from-[#FF3CAC] to-[#FF7A18] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0');
            content = content.replace(/bg-\[\#8B4049\] hover:bg-\[\#7A3740\]/g, 'bg-gradient-to-r from-[#FF3CAC] to-[#FF7A18] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0');

            content = content.replace(/bg-\[\#D4AF37\]/g, 'bg-gradient-to-r from-[#FF3CAC] to-[#FF7A18]');
            content = content.replace(/bg-\[\#E59E1A\]/g, 'bg-gradient-to-r from-[#FF3CAC] to-[#FF7A18]');
            content = content.replace(/bg-\[\#8B4049\]/g, 'bg-gradient-to-r from-[#FF3CAC] to-[#FF7A18]');

            content = content.replace(/stopColor="#D4AF37"/g, 'stopColor="#FF7A18"');
            content = content.replace(/stroke="#D4AF37"/g, 'stroke="#FF7A18"');
            content = content.replace(/stroke="#8B4049"/g, 'stroke="#FF3CAC"');
            content = content.replace(/text-[#E8CA72]/g, 'text-[#FF7A18]');

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

dirs.forEach(processDir);
