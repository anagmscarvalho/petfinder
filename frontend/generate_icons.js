const fs = require('fs');

function extractIcon(name, file, matchPatterns, padding = 2) {
    const content = fs.readFileSync(file, 'utf-8');
    const paths = [];
    
    // Find all paths that match any of the patterns (regex strings)
    const allElements = content.match(/<(path|circle|rect|line)\s[^>]*>/g) || [];
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const el of allElements) {
        let isMatch = false;
        for (const pattern of matchPatterns) {
            if (el.includes(pattern)) {
                isMatch = true;
                break;
            }
        }
        
        if (isMatch) {
            // Modify stroke/fill to be customizable, except for gradients/complex
            let modifiedEl = el;
            if (modifiedEl.includes('stroke=')) {
                modifiedEl = modifiedEl.replace(/stroke="[^"]+"/, 'stroke={color}');
            }
            if (modifiedEl.includes('fill=')) {
                modifiedEl = modifiedEl.replace(/fill="[^"]+"/, 'fill={color}');
            } else if (!modifiedEl.includes('stroke=')) {
                // If it has no fill and no stroke, it might default to black fill. Let's add fill={color}
                modifiedEl = modifiedEl.replace('/>', ' fill={color} />').replace('></path>', ' fill={color}></path>');
            }
            
            // Extract coordinates to calculate viewBox
            const dMatch = el.match(/d="([^"]+)"/);
            if (dMatch) {
                const nums = dMatch[1].match(/-?[\d.]+/g);
                if (nums) {
                    for (let i = 0; i < nums.length; i++) {
                        const val = parseFloat(nums[i]);
                        if (isNaN(val)) continue;
                        
                        // Heuristic: even indices are roughly X, odd are roughly Y (not perfectly true for all SVG commands, but works for bounding box approximation if we have many points)
                        if (val > 0 && val < 500) {
                             // Too rough. Let's just use the manual viewboxes I found
                        }
                    }
                }
            }
            
            paths.push(modifiedEl);
        }
    }
    
    return paths;
}

const icons = {
    Search: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M38 82C42.4183', 'M44 80L49 85'],
        viewBox: '28 64 24 24'
    },
    SearchTab: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M37 746C41.4183', 'M43 744L48 749'],
        viewBox: '27 728 24 24'
    },
    Bell: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M263.5 726.281C264.07', 'M262.469 747.938', 'M263.5 731.094'],
        viewBox: '250 724 24 27'
    },
    Plus: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M188 724V744', 'M178 734H198'],
        viewBox: '176 722 24 24'
    },
    Profile: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M335 738C338.314', 'M326 748C326 742'],
        viewBox: '324 724 22 26'
    },
    Heart: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M342 382C341 381 336'],
        viewBox: '334 370 16 14'
    },
    ArrowLeft: {
        file: 'telas_figma/detalhes_pet.svg',
        paths: ['M22 10l-8 8 8 8'],
        viewBox: '12 8 12 20'
    },
    Camera: {
        file: 'telas_figma/telas parciais/cadastrar-pet.svg',
        paths: ['M197 118H177', 'M187 136C190.314', 'M181 118L184'],
        viewBox: '171 111 32 32'
    },
    ChatList: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M272 127C274.761 127', 'M265 134C265 130 268'],
        viewBox: '260 115 24 24' 
    },
    Paw: {
        file: 'telas_figma/telas parciais/feed-main.svg',
        paths: ['M105.242 731C106', 'M113.992 736C115', 'M116.492 746C117', 'M102.742 736C103'],
        viewBox: '100 724 24 28'
    },
    DoorOut: { // For logout
        file: 'telas_figma/telas parciais/profile.svg', // Might not exist, we'll create a simple one or reuse something
        paths: [],
        viewBox: '0 0 24 24'
    },
    Settings: {
        paths: [],
        viewBox: '0 0 24 24'
    },
    Info: {
        paths: [],
        viewBox: '0 0 24 24'
    },
    Edit: {
        paths: [],
        viewBox: '0 0 24 24'
    }
};

// Some fallback icons for Profile menu (since we might not have all of them cleanly in SVGs)
const fallbackIcons = {
    DoorOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
    Settings: '<circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
    Info: '<circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/><path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>',
    Edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>'
};

let output = `import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

`;

for (const [name, config] of Object.entries(icons)) {
    let paths = [];
    if (config.file && config.paths.length > 0) {
        paths = extractIcon(name, config.file, config.paths);
    } else if (fallbackIcons[name]) {
        paths = [fallbackIcons[name]];
    }
    
    // Add default fill/stroke to paths if missing, based on the original extracted SVGs
    paths = paths.map(p => {
        let modified = p;
        if (!modified.includes('stroke=') && !modified.includes('fill=')) {
            modified = modified.replace('/>', ' fill={color} />').replace('></path>', ' fill={color}></path>');
        }
        return modified;
    });

    output += `export const ${name}Icon = ({ size = 24, color = '#000', style }) => (
  <Svg width={size} height={size} viewBox="${config.viewBox}" style={style}>
    ${paths.join('\n    ')}
  </Svg>
);\n\n`;
}

fs.writeFileSync('src/components/Icons.js', output);
console.log('Icons.js generated successfully!');
