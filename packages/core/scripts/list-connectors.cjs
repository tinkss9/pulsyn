const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/connectors');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && !['index.ts','registry.ts','base.ts','saas-base.ts'].includes(f));
const names = [];
for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  const m = content.match(/@registerSource\(['"]([^'"]+)['"]\)/);
  if (m) names.push(m[1]);
}
names.sort();
console.log(names.join(', '));
