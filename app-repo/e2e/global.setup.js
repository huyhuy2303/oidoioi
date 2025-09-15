const http = require('http');
const { spawn } = require('child_process');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.abort();
      reject(new Error('timeout'));
    });
  });
}

async function waitForProducts(baseUrl, timeoutMs = 60000) {
  const start = Date.now();
  const url = `${baseUrl.replace(/\/$/, '')}/api/product/list?sortOrder=%7B%22_id%22%3A-1%7D&rating=0&min=1&max=999999`;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await httpGet(url);
      if (res.status === 200) {
        const json = JSON.parse(res.body);
        if (Array.isArray(json.products) && json.products.length > 0) return true;
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1500));
  }
  return false;
}

async function seedIfEmpty() {
  const apiBase = process.env.E2E_API_BASE || 'http://localhost:3000';
  // If products already exist, skip seeding
  const hasProducts = await waitForProducts(apiBase, 5000);
  if (hasProducts) return;

  // Run seed script against local DB
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['server/utils/seed.js', 'admin@rmit.edu.vn', 'mypassword'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/rmit_database'
      }
    });
    child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`seed exit ${code}`))));
    child.on('error', reject);
  });

  // Wait until products are available
  await waitForProducts(apiBase, 60000);
}

module.exports = async () => {
  // Only run in local dev contexts
  await seedIfEmpty();
};

