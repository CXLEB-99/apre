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
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: (name) => {
          if (name === 'users') {
            return {
              findOne: async () => ({ _id: 'supervisorObjectId' }) // supervisor exists
            };
          }
          if (name === 'agents') {
            return {
              find: () => ({
                toArray: async () => [{ agentId: 1001 }, { agentId: 1002 }]
              })
            };
          }
          if (name === 'agentPerformance') {
            return {
              aggregate: () => ({
                toArray: async () => [
                  { agent: 'Jane Smith', totalDuration: 300, averageDuration: 150, callCount: 2 }
                ]
              })
            };
          }
        }
      };
      await callback(db);
    });

    const res = await request(app)
      .get('/api/reports/agent-performance/by-supervisor?supervisor=jsmith');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      { agent: 'Jane Smith', totalDuration: 300, averageDuration: 150, callCount: 2 }
    ]);
  });

  it('should return 400 if supervisor query param is missing', async () => {
    const res = await request(app)
      .get('/api/reports/agent-performance/by-supervisor');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing required query parameter: supervisor');
  });

  it('should return 404 if supervisor is not found', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: () => ({
          findOne: async () => null // Supervisor not found
        })
      };
      await callback(db);
    });

    const res = await request(app)
      .get('/api/reports/agent-performance/by-supervisor?supervisor=unknown');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Supervisor not found');
  });

  it('should return empty array if no agents found', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: (name) => ({
          findOne: async () => ({ _id: 'supervisorId' }), // Found supervisor
          find: () => ({
            toArray: async () => [] // No agents
          })
        })
      };
      await callback(db);
    });

    const res = await request(app)
      .get('/api/reports/agent-performance/by-supervisor?supervisor=jsmith');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return 500 if there is a server error', async () => {
    mongo.mockImplementation(async () => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/reports/agent-performance/by-supervisor?supervisor=jsmith');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Error connecting to db');
  });
});
