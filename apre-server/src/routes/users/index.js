/**
 * Author: Professor Krasso, Modified by Caleb Goforth
 * Date: 6/14/2025
 * File: users/index.js
 * Description: Routes for the users collection with filtering support.
 */

'use strict';

const express = require('express');
const { mongo } = require('../../utils/mongo');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const router = express.Router();
const saltRounds = 10;

// GET /users (with optional role filter)
router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;

    mongo(async db => {
      const query = role ? { role } : {};
      const projection = role ? { username: 1, _id: 0 } : {};
      const users = await db.collection('users').find(query).project(projection).toArray();

      console.log('Filtered user list:', users);
      res.send(users);
    }, next);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET /users/:id
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    mongo(async db => {
      const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
      res.send(user);
    }, next);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// POST /users
router.post('/', (req, res, next) => {
  try {
    const { user } = req.body;

    user.passwordHash = bcrypt.hashSync(user.passwordHash, saltRounds);
    user.createdAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    mongo(async db => {
      const result = await db.collection('users').insertOne(user);
      res.send({ id: result.insertedId });
    }, next);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// PUT /users/:id
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, role, email, password } = req.body;
    const updateFields = {};

    if (username) updateFields.username = username;
    if (role) updateFields.role = role;
    if (email) updateFields.email = email;
    if (password) updateFields.passwordHash = bcrypt.hashSync(password, saltRounds);

    updateFields.updatedAt = new Date().toISOString();

    mongo(async db => {
      await db.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );
      res.send({ id });
    }, next);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// DELETE /users/:id
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    mongo(async db => {
      await db.collection('users').deleteOne({ _id: new ObjectId(id) });
      res.send({ id });
    }, next);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
