/**
 * Author: Caleb
 * Description: Unit tests for the GET /reports/agent-performance/by-supervisor API route
 */

const request = require('supertest');
const express = require('express');
const agentPerformanceBySupervisorRouter = require('../../../../src/routes/reports/agent-performance/by-supervisor');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

const app = express();
app.use(express.json());
app.use('/api/reports/agent-performance/by-supervisor', agentPerformanceBySupervisorRouter);

describe('GET /api/reports/agent-performance/by-supervisor', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  it('should return agent performance data for a valid supervisor', async () => {
    const mockData = [
      { agent: 'Agent A', callDuration: 120 },
      { agent: 'Agent B', callDuration: 90 }
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

    const res = await request(app).get('/api/reports/agent-performance/by-supervisor?supervisor=Smith');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  it('should return 400 if supervisor query param is missing', async () => {
    const res = await request(app).get('/api/reports/agent-performance/by-supervisor');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Supervisor is required');
  });

  it('should return 500 if there is a server error', async () => {
    mongo.mockImplementation(async () => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/reports/agent-performance/by-supervisor?supervisor=Smith');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error connecting to db/i);
  });
});
