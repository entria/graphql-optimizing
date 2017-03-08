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
      // TODO implement this
      // resolve: async (obj, args, { user }) => await VenueLoader.load(user, obj.venue),
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
      // TODO implement this
    },
    venue: {
      type: VenueType,
      // TODO implement this
    },
    viewerRsvp: {
      type: GraphQLBoolean,
      // TODO implement this
      // resolve: async (obj, args, { user }) => await VenueLoader.load(user, obj.venue),
    },
    attendingFriendsOfViewer: {
      type: UserConnection.connectionType,
      args: {
        ...connectionArgs,
      },
      // TODO implement this
      // resolve: (obj, args, { user }) => UserLoader.loadUsers(user, args),
    }
  }),
  interfaces: () => [NodeInterface],
});
