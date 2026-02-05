const request = require('supertest');
const app = require('../src/index');

describe('API Health Check', () => {
  it('should return 404 for root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(404);
  });
});
