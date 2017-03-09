// @flow

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';
import {
  globalIdField,
  connectionArgs,
  connectionDefinitions,
} from 'graphql-relay';
import {
  NodeInterface,
} from '../interface/NodeInterface';

import EventConnection from '../connection/EventConnection';

import { getConnection } from '../connection/helper';
import { getUpcomingEventIdsForUser, getEvent } from '../resolvers';

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'User data',
  fields: () => ({
    id: globalIdField('User'),
    _id: {
      type: GraphQLString,
      resolve: user => user._id,
    },
    name: {
      type: GraphQLString,
      resolve: user => user.name,
    },
    email: {
      type: GraphQLString,
      resolve: user => user.email,
    },
    active: {
      type: GraphQLBoolean,
      resolve: user => user.active,
    },
    upcomingEvent: {
      type: EventConnection.connectionType,
      args: {
        ...connectionArgs,
      },
      resolve: async (user, args, context, info) => {
        const eventIds = await getUpcomingEventIdsForUser(user._id, args.first);

        return getConnection(eventIds, getEvent);
      },
    }
  }),
  interfaces: () => [NodeInterface],
});

export const UserConnection = connectionDefinitions({
  name: 'User',
  nodeType: UserType,
});

export default UserType;

