// Module: Agent Performance Reports by Supervisor
'use strict';

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { mongo } = require('../../../../utils/mongo');

/**
 * GET /api/reports/agent-performance/by-supervisor/available-supervisors
 */
router.get('/available-supervisors', (req, res, next) => {
  try {
    mongo(async db => {
      const supervisors = await db
        .collection('users')
        .find({ role: 'supervisor' })
        .project({ username: 1, _id: 0 })
        .toArray();

      const usernames = supervisors.map(u => u.username);
      res.send(usernames.sort());
    }, next);
  } catch (err) {
    console.error('Error getting available supervisors:', err);
    next(err);
  }
});

/**
 * GET /api/reports/agent-performance/by-supervisor?supervisor=username
 */
router.get('/', (req, res, next) => {
  const { supervisor } = req.query;
  if (!supervisor) {
    return res.status(400).send({ message: 'Missing required query parameter: supervisor' });
  }

  try {
    mongo(async db => {
      const supervisorDoc = await db.collection('users').findOne({ username: supervisor });
      if (!supervisorDoc) {
        return res.status(404).send({ message: 'Supervisor not found' });
      }

      // ⛑ Ensure _id is treated as ObjectId (in case Mongo driver returns string)
      const supId = new ObjectId(supervisorDoc._id);

      const agents = await db
        .collection('agents')
        .find({ supervisorId: supId })
        .toArray();
      const agentIds = agents.map(a => a.agentId);

      if (agentIds.length === 0) return res.send([]);

      const results = await db.collection('agentPerformance').aggregate([
        { $match: { agentId: { $in: agentIds } } },
        {
          $group: {
            _id: '$agentId',
            totalDuration: { $sum: '$callDuration' },
            averageDuration: { $avg: '$callDuration' },
            callCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: '_id',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        { $unwind: '$agentDetails' },
        {
          $project: {
            _id: 0,
            agent: '$agentDetails.name',
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
