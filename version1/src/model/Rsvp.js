// @flow

import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

/**
 * users that rsvp the event
 */
const Schema = new mongoose.Schema({
  event: {
    type: ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'rsvp',
});

export default mongoose.model('Rsvp', Schema);
