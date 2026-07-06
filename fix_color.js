const fs = require('fs');
let code = fs.readFileSync('src/components/auth/Login.tsx', 'utf8');

// Find the start button section
const target = "background: '#DCA038', color: '#000'";
const replacement = "background: '#DCA038', color: '#fff'";

code = code.replace(target, replacement);

fs.writeFileSync('src/components/auth/Login.tsx', code);
