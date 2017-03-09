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

const logger = (f) => {

  const newFn = (args) => {
    const start = new Date();
    const val = f(args);
    const end = new Date();
    console.log(`${start.toISOString()},${end.toISOString()},${f.name}`);
    return val;
  };

  return newFn;
};

const _getUser = async (id) => {
  return User.findOne({ _id: id });
};
export const getUser = logger(_getUser);

const _getUpcomingEventIdsForUser = async (userId, first) => {
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
export const getUpcomingEventIdsForUser = logger(_getUpcomingEventIdsForUser);

const _getEvent = async (id) => {
  return Event.findOne({ _id: id });
};
export const getEvent = logger(_getEvent);

const _getViewerMetadataForEvent = async (userId, eventId) => {
  const rsvp = await Rsvp.count({
    user: userId,
    event: eventId,
  });

  return rsvp > 0;
};
export const getViewerMetadataForEvent = logger(_getViewerMetadataForEvent);

const _getTags = async (ids) => {
  return Tag.find({_id: { $in: ids }});
};
export const getTags = logger(_getTags);

const _getVenue = async (id) => {
  return Venue.findOne({ _id: id });
};
export const getVenue = logger(_getVenue);

const _getViewerFriendIdsAttendingEvent = async (userId, eventId, first) => {
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
export const getViewerFriendIdsAttendingEvent = logger(_getViewerFriendIdsAttendingEvent);
