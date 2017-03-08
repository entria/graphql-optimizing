// @flow

import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { globalIdField } from 'graphql-relay';

import { NodeInterface } from '../interface/NodeInterface';
import UserType from './UserType';

export default new GraphQLObjectType({
  name: 'Friendship',
  description: 'Represents Friendship',
  fields: () => ({
    id: globalIdField('Friendship'),
    friend1: {
      type: UserType,
      description: '',
      // TODO implement this
      // resolve: async (obj, args, { user }) => await Friend1Loader.load(user, obj.friend1),
    },
    friend2: {
      type: UserType,
      description: '',
      // TODO implement this
      // resolve: async (obj, args, { user }) => await Friend2Loader.load(user, obj.friend2),
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
