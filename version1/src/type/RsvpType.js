// @flow

import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { globalIdField } from 'graphql-relay';

import { NodeInterface } from '../interface/NodeInterface';
import EventType from './EventType';
import UserType from './UserType';

export default new GraphQLObjectType({
  name: 'Rsvp',
  description: 'Represents Rsvp',
  fields: () => ({
    id: globalIdField('Rsvp'),
    event: {
      type: EventType,
      description: '',
      // TODO implement this
      // resolve: async (obj, args, { user }) => await EventLoader.load(user, obj.event),
    },
    user: {
      type: UserType,
      description: '',
      // TODO implement this
      // resolve: async (obj, args, { user }) => await UserLoader.load(user, obj.user),
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
  }),
  interfaces: () => [NodeInterface],
});
