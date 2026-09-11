const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');

if (fs.existsSync(docsDir)) {
  console.log('\n[logged-sdk] Docs installed successfully. See: node_modules/@oheoco/logged/docs\n');
} else {
  console.warn('\n[logged-sdk] Docs bundle was not found in the installed package.\n');
}
