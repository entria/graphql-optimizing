// @flow

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import {
  globalIdField,
  connectionArgs,
  fromGlobalId,
} from 'graphql-relay';
import { NodeInterface } from '../interface/NodeInterface';

import UserType from './UserType';
// import { UserConnection } from './UserType';

export default new GraphQLObjectType({
  name: 'Viewer',
  description: '...',
  fields: () => ({
    id: globalIdField('Viewer'),
    me: {
      type: UserType,
      // resolve: (root, args, { user }) => UserLoader.load(user, user._id),
    },
    user: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      // TODO implement this
      // resolve: (obj, args, { user }) => {
      //   const { id } = fromGlobalId(args.id);
      //   return UserLoader.load(user, id);
      // },
    },
    // users: {
    //   type: UserConnection.connectionType,
    //   args: {
    //     ...connectionArgs,
    //     search: {
    //       type: GraphQLString,
    //     },
    //   },
    //   resolve: (obj, args, { user }) => UserLoader.loadUsers(user, args),
    // },
  }),
  interfaces: () => [NodeInterface],
});
