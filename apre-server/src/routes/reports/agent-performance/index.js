/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');
const agentPerformanceBySupervisorRouter = require('./by-supervisor');

const router = express.Router();

// ────────────────────────────────────────────────────────────────────────────────
// MOUNT the by-supervisor sub-router here, *not* inside any GET handler.
// This makes these endpoints available immediately on startup.
// ────────────────────────────────────────────────────────────────────────────────
router.use(
  '/by-supervisor',
  agentPerformanceBySupervisorRouter
);

/**
 * GET /api/reports/agent-performance/call-duration-by-date-range
 * Fetch agents’ call durations over a date range.
 */
router.get('/call-duration-by-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return next(createError(400, 'Start date and end date are required'));
    }

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        { $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
        { $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        { $unwind: '$agentDetails' },
        { $group: { _id: '$agentDetails.name', totalCallDuration: { $sum: '$callDuration' } } },
        { $project: { _id: 0, agent: '$_id', callDuration: '$totalCallDuration' } },
        { $group: { _id: null, agents: { $push: '$agent' }, callDurations: { $push: '$callDuration' } } },
        { $project: { _id: 0, agents: 1, callDurations: 1 } }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /call-duration-by-date-range', err);
    next(err);
  }
});

module.exports = router;
