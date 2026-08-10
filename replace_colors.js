const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-\\[#F5F7FA\\]': 'bg-background',
  'text-slate-900': 'text-text',
  'text-slate-800': 'text-text',
  'text-slate-700': 'text-text-secondary',
  'text-slate-600': 'text-text-secondary',
  'text-slate-500': 'text-text-muted',
  'text-slate-400': 'text-text-disabled',
  'text-slate-300': 'text-text-disabled',

  'bg-emerald-500': 'bg-primary',
  'bg-emerald-600': 'bg-primary-hover',
  'bg-emerald-100\\/60': 'bg-primary-soft',
  'bg-emerald-100\\/70': 'bg-primary-soft',
  'bg-emerald-100': 'bg-primary-light',
  'bg-emerald-50': 'bg-primary-light',
  
  'text-emerald-500': 'text-primary',
  'text-emerald-600': 'text-primary-hover',
  'text-emerald-700': 'text-primary-active',

  'border-emerald-500': 'border-primary',
  'border-emerald-400': 'border-primary',
  'border-emerald-200': 'border-primary-light',

  'shadow-emerald-500\\/30': 'shadow-lg',
  
  'bg-white\\/40': 'bg-glass',
  'bg-white\\/50': 'bg-glass',
  'bg-white\\/30': 'bg-glass',
  'bg-white\\/60': 'bg-glass-hover',
  'bg-white\\/70': 'bg-glass-hover',
  
  'border-white\\/40': 'border-border',
  'border-white\\/30': 'border-border',
  'border-white\\/20': 'border-border',
  'border-white\\/10': 'border-border',
};

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        content = content.replace(regex, value);
      }
      
      // Fix double replacements or leftover classes if needed
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Done replacing colors.');
