/**
 * Resolvers
 */

import {
  User,
  Event,
  Tag,
  Venue,
  Rsvp,
  Friendship,
} from './model';

export const getUser = async (id) => {
  return User.findOne({ _id: id });
};

export const getUpcomingEventIdsForUser = async (userId, first) => {
  const events = await Event
    .find({
      guests: userId,
      date: {
        $gte: new Date(),
      },
    })
    .limit(first)
    .select({ _id: 1 });

  return events.map((event) => event._id);
};

export const getEvent = async (id) => {
  return Event.findOne({ _id: id });
};

export const getViewerMetadataForEvent = async (userId, eventId) => {
  const rsvp = await Rsvp.count({
    user: userId,
    event: eventId,
  });

  return rsvp > 0;
};

export const getTags = async (ids) => {
  return Tag.find({_id: { $in: ids }});
};

export const getVenue = async (id) => {
  return Venue.findOne({ _id: id });
};

export const getViewerFriendIdsAttendingEvent = async (userId, eventId, first) => {
  const rvsps = await Rsvp
    .find({
      event: eventId,
    })
    .select('user');

  const ids = rvsps.map((rvsp) => rvsp.user);

  // console.log('friends: ', ids, userId);

  const friends = await Friendship
    .find({
      $and: [
        {
          $or: [
            { friend1: userId },
            { friend2: userId },
          ],
        },
        {
          $or: [
            { friend1: { $in: ids  } },
            { friend2: { $in: ids } },
          ],
        },
      ],
    })
    .limit(first)
    .select({ friend1: 1, friend2: 1 });

  return friends.map((friend) => friend.friend1.toString() === userId.toString() ? friend.friend2 : friend.friend1);
};
