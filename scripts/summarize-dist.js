#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return v.toFixed(1) + ' ' + units[i];
}

function listFiles(dir) {
  const result = [];
  const walk = d => {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else result.push({ path: p, size: st.size });
    }
  };
  walk(dir);
  return result;
}

const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.log(JSON.stringify({ exists: false }));
  process.exit(0);
}

const files = listFiles(distDir);
const totalBytes = files.reduce((a, b) => a + b.size, 0);
const top = [...files].sort((a, b) => b.size - a.size).slice(0, 5).map(f => ({
  file: path.relative(distDir, f.path),
  bytes: f.size,
  size: formatBytes(f.size),
}));

console.log(JSON.stringify({ exists: true, totalBytes, total: formatBytes(totalBytes), top }, null, 2));


