const fs = require('fs');
const data = JSON.parse(fs.readFileSync('.data/kv_export.json','utf8'));
const counts = {};
for (const row of data) {
  const key = row.key || '';
  const prefix = key.includes(':') ? key.split(':')[0] : key;
  counts[prefix] = (counts[prefix] || 0) + 1;
}
console.log(counts);
