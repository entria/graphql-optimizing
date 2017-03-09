// @flow

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLList,
} from 'graphql';
import { globalIdField, connectionArgs } from 'graphql-relay';

import { NodeInterface } from '../interface/NodeInterface';

import { UserConnection } from './UserType';
import TagType from './TagType';
import VenueType from './VenueType';

import { getConnection } from '../connection/helper';

import {
  getVenue,
  getTags,
  getViewerMetadataForEvent,
  getViewerFriendIdsAttendingEvent,
  getUser,
} from '../resolvers';

export default new GraphQLObjectType({
  name: 'Event',
  description: 'Represents Event',
  fields: () => ({
    id: globalIdField('Event'),
    name: {
      type: GraphQLString,
      description: '',
      resolve: obj => obj.name,
    },
    date: {
      type: GraphQLString,
      description: '',
      resolve: obj => obj.date.toISOString(),
    },
    startTime: {
      type: GraphQLString,
      description: '',
      resolve: obj => obj.startTime.toISOString(),
    },
    endTime: {
      type: GraphQLString,
      description: '',
      resolve: obj => obj.endTime.toISOString(),
    },
    venue: {
      type: VenueType,
      description: '',
      resolve: (event) => getVenue(event.venue),
    },
    createdAt: {
      type: GraphQLString,
      description: '',
      resolve: obj => obj.createdAt.toISOString(),
    },
    updatedAt: {
      type: GraphQLString,
      description: '',
      resolve: obj => obj.updatedAt.toISOString(),
    },
    tags: {
      type: new GraphQLList(TagType),
      resolve: (event) => getTags(event.tags),
    },
    viewerRsvp: {
      type: GraphQLBoolean,
      resolve: (event, args, { user }) => {
        return getViewerMetadataForEvent(user._id, event._id);
      },
    },
    attendingFriendsOfViewer: {
      type: UserConnection.connectionType,
      args: {
        ...connectionArgs,
      },
      resolve: async (event, args, { user }) => {
        const friendIds = await getViewerFriendIdsAttendingEvent(user._id, event._id, args.first);

        return getConnection(friendIds, getUser);
      },
    },
  }),
  interfaces: () => [NodeInterface],
});
