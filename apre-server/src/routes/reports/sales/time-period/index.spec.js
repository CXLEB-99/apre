const request = require('supertest');
const app = require('../../../../../app');

describe('GET /api/reports/sales/time-period', () => {
  it('should return 400 if startDate or endDate is missing', async () => {
    const res = await request(app).get('/api/reports/sales/time-period');
    expect(res.statusCode).toEqual(400);
  });

  it('should return 200 with valid query params', async () => {
    const res = await request(app)
      .get('/api/reports/sales/time-period?startDate=2024-01-01&endDate=2024-12-31');
    expect(res.statusCode).toEqual(200);
  });

  it('should return salesData array in response', async () => {
    const res = await request(app)
      .get('/api/reports/sales/time-period?startDate=2024-01-01&endDate=2024-12-31');
    expect(Array.isArray(res.body)).toBe(true);
  });
});
