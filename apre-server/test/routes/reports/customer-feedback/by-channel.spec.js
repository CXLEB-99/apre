/**
 * Author: Caleb Goforth
 * Description: Unit tests for the GET /reports/customer-feedback/by-channel API route
 */

const request = require('supertest');
const express = require('express');
const byChannelRouter = require('../../../../src/routes/reports/customer-feedback/by-channel');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

const app = express();
app.use('/api/reports/customer-feedback/by-channel', byChannelRouter);

describe('GET /api/reports/customer-feedback/by-channel', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  it('should return aggregated customer feedback by channel', async () => {
    const mockData = [
      { channel: 'Phone', averageRating: 4.5 },
      { channel: 'Email', averageRating: 3.8 }
    ];

    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockData)
        })
      };
      await callback(db);
    });

    const res = await request(app).get('/api/reports/customer-feedback/by-channel');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  it('should return 500 if a database error occurs', async () => {
    mongo.mockImplementation(async () => {
      throw new Error('Simulated DB error');
    });

    const res = await request(app).get('/api/reports/customer-feedback/by-channel');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error connecting to db/i);
  });
});
