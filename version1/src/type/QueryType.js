// @flow

import { GraphQLObjectType, GraphQLNonNull, GraphQLID } from 'graphql';
import { NodeField } from '../interface/NodeInterface';

// import ViewerLoader from '../loader/ViewerLoader';
// import ViewerType from './ViewerType';

import UserType from './UserType';

export default new GraphQLObjectType({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    node: NodeField,
    // viewer: {
    //   type: ViewerType,
    //   args: {},
    //   resolve: async (obj, args, { user }) =>
    //      await ViewerLoader.load(user ? user._id : null)
    //   ,
    // },
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
  }),
});
