// @flow

import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: false,
    index: true,
  },
  endEnd: {
    type: Date,
    required: false,
    index: true,
  },
  tags: [{type: ObjectId, ref: 'Tag'}],
  venue: {
    type: ObjectId,
    ref: 'Venue',
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'event',
});

export default mongoose.model('Event', Schema);
