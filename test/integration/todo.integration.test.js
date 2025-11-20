import { expect } from 'chai';

// Load environment variables
const STAGING =
  process.env.STAGING_URL ||
  'https://todo-worker-staging.111naveenkumarrk.workers.dev';
const PROD =
  process.env.PROD_URL || 'https://todo-worker.111naveenkumarrk.workers.dev';

// Normalize function to ensure https:// prefix exists
function normalize(url) {
  return url.startsWith('http') ? url : `https://${url}`;
}

const STAGING_BASE = normalize(STAGING);
const PROD_BASE = normalize(PROD);

/* ------------------------------
   SHARED TEST HELPERS
--------------------------------*/
async function testRandomEndpoint(baseUrl) {
  const res = await fetch(`${baseUrl}/random`);
  const text = await res.text();

  // HTTP status must be 200
  expect(res.status).to.equal(200);

  // Body must follow format
  expect(text.startsWith('random number is:')).to.be.true;

  // Extract number
  const numStr = text.replace('random number is:', '').trim();
  const num = Number(numStr);

  // Validate number
  expect(!isNaN(num)).to.equal(true);
  expect(num).to.be.within(0, 1);
}

/* ------------------------------
   STAGING TESTS
--------------------------------*/
describe('Integration: STAGING Environment', () => {
  it('GET /health → 200', async () => {
    const res = await fetch(`${STAGING_BASE}/health`);
    expect(res.status).to.equal(200);
  });

  it('GET /api/todos → returns array', async () => {
    const res = await fetch(`${STAGING_BASE}/api/todos`);
    expect(res.status).to.equal(200);
    const json = await res.json();
    expect(json).to.be.an('object');
  });

  it('GET /random → returns random number', async () => {
    await testRandomEndpoint(STAGING_BASE);
  });
});

/* ------------------------------
   PRODUCTION TESTS
   (only run if PROD_URL is provided)
--------------------------------*/
if (process.env.PROD_URL) {
  describe('Integration: PRODUCTION Environment', () => {
    it('GET /health → 200', async () => {
      const res = await fetch(`${PROD_BASE}/health`);
      expect(res.status).to.equal(200);
    });

    it('GET /api/todos → returns array', async () => {
      const res = await fetch(`${PROD_BASE}/api/todos`);
      expect(res.status).to.equal(200);
      const json = await res.json();
      expect(json).to.be.an('object');
    });

    it('GET /random → returns random number', async () => {
      await testRandomEndpoint(PROD_BASE);
    });
  });
}
