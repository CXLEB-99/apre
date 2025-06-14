/**
 * Author: Caleb Goforth
 * Date: 6/13/2025
 * File: by-supervisor/index.js
 * Description: API route to fetch agent performance data by supervisor.
 */

'use strict';

const express = require('express');
const router = express.Router();
const { mongo } = require('../../../../utils/mongo');

/**
 * GET /api/reports/agent-performance/by-supervisor?supervisor=John Doe
 *
 * Returns call duration or other performance metrics grouped by agent under a specific supervisor.
 */
router.get('/', (req, res, next) => {
  const { supervisor } = req.query;

  if (!supervisor) {
    return res.status(400).send({ message: 'Missing required query parameter: supervisor' });
  }

  try {
    mongo(async db => {
      const results = await db.collection('agent-performance').aggregate([
        { $match: { supervisor } },
        {
          $group: {
            _id: '$agent',
            totalDuration: { $sum: '$callDuration' },
            averageDuration: { $avg: '$callDuration' },
            callCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            totalDuration: 1,
            averageDuration: 1,
            callCount: 1
          }
        },
        { $sort: { agent: 1 } }
      ]).toArray();

      res.send(results);
    }, next);
  } catch (err) {
    console.error('Error getting agent performance data by supervisor:', err);
    next(err);
  }
});

module.exports = router;
