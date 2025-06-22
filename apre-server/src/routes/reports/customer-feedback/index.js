/**
 * Author: Caleb Goforth & Professor Krasso
 * Date: 6/20/25
 * File: index.js
 * Description: Apre customer feedback API routes for customer feedback reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * GET /channel-rating-by-month
 * Fetches average customer feedback ratings by channel for a specified month.
 */
router.get('/channel-rating-by-month', (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, 'month is required'));
    }

    mongo(async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $group: {
            _id: {
              channel: '$channel',
              month: { $month: '$date' }
            },
            ratingAvg: { $avg: '$rating' }
          }
        },
        {
          $match: {
            '_id.month': Number(month)
          }
        },
        {
          $group: {
            _id: '$_id.channel',
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            ratingAvg: 1
          }
        },
        {
          $group: {
            _id: null,
            channels: { $push: '$channel' },
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channels: 1,
            ratingAvg: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /channel-rating-by-month', err);
    next(err);
  }
});

/**
 * GET /by-channel
 * Aggregates average feedback rating grouped by feedback source (channel).
 */
router.get('/by-channel', async (req, res, next) => {
  try {
    await mongo(async db => {
      const result = await db.collection('customerFeedback').aggregate([
        {
          $group: {
            _id: '$feedbackSource',
            averageRating: { $avg: '$rating' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            averageRating: { $round: ['$averageRating', 2] }
          }
        }
      ]).toArray();

      res.status(200).json(result);
    }, next);
  } catch (err) {
    console.error('Error in /by-channel', err);
    next(err);
  }
});

module.exports = router;
