// @flow

import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const Schema = new mongoose.Schema({
  friend1: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  friend2: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'friendship',
});

export default mongoose.model('Friendship', Schema);
