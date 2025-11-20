import { expect } from 'chai';

const raw =
  process.env.BASE_URL ||
  'https://todo-worker-staging.111naveenkumarrk.workers.dev';

if (!raw) {
  throw new Error('❌ BASE_URL is missing. Set BASE_URL in env.');
}

// Auto-fix missing protocol
const base = raw.startsWith('http') ? raw : `https://${raw}`;

describe('Integration: Todos API', () => {
  it('GET /health → 200', async () => {
    const res = await fetch(`${base}/health`);
    expect(res.status).to.equal(200);
  });

  it('GET /todos → returns array', async () => {
    const res = await fetch(`${base}/api/todos`);
    expect(res.status).to.equal(200);
    const json = await res.json();
    expect(json).to.be.an('object');
  });
});
