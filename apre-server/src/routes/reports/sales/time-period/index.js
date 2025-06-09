const express = require('express');
const router = express.Router();
const mongo = require('../../../../utils/mongo');

router.get('/', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).send('Start date or end date parameter is missing');
    }

    mongo(async db => {
      const salesByTimePeriod = await db.collection('sales').aggregate([
        {
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: 1,
            region: 1,
            product: 1,
            category: 1,
            customer: 1,
            salesperson: 1,
            channel: 1,
            amount: 1
          }
        }
      ]).toArray();

      res.send(salesByTimePeriod);
    }, next);
  } catch (err) {
    console.error('Error getting sales data by time period: ', err);
    next(err);
  }
});

module.exports = router;
