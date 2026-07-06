const fs = require('fs');
let code = fs.readFileSync('src/components/auth/Login.tsx', 'utf8');

code = code.replace(/padding: '20px 25px'/g, "padding: '16px 20px'");
// We only want to replace borderRadius: '16px' in the physical issues step, so let's do a more specific replace if possible.
// But earlier we saw that it had border radius 16px. There are other places with 16px border radius:
// `borderRadius: '16px'` - maybe we just replace them all to 14px or leave them.
// Let's replace only the specific one in step 12.
code = code.replace(/border: \`2px solid \$\{physicalIssues\.includes\(issue\) \? '#DCA038' : 'rgba\(255,255,255,0\.1\)'\}\`,\\s*borderRadius: '16px'/g, "border: `2px solid ${physicalIssues.includes(issue) ? '#DCA038' : 'rgba(255,255,255,0.1)'}`, borderRadius: '14px'");

fs.writeFileSync('src/components/auth/Login.tsx', code);
