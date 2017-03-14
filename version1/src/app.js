// @flow

import 'isomorphic-fetch';

import Koa from 'koa';
import Router from 'koa-router';
import cors from 'koa-cors';
import graphqlHTTP from 'koa-graphql';
import convert from 'koa-convert';
import logger from 'koa-logger';

import { schema } from './schema';
import { jwtSecret } from './config';
import { getUser } from './auth';

import {
  instrumentMiddleware,
  instrumentSchema,
  newContext,
} from './instrument';

const app = new Koa();

app.keys = jwtSecret;

const router = new Router();

instrumentSchema(schema);

app.use(logger());
app.use(convert(cors()));
app.use(instrumentMiddleware());
router.all('/graphql', convert(graphqlHTTP(async (req) => {
  console.log('/graphql: ', req._instrumentContext);
  const { user } = await getUser(req.header.authorization);

  return {
    graphiql: process.env.NODE_ENV !== 'production',
    schema,
    context: {
      user,
      instrumentContext: newContext(req),
    },
    formatError: (error) => {
      console.log(error.message);
      console.log(error.locations);
      console.log(error.stack);

      return {
        message: error.message,
        locations: error.locations,
        stack: error.stack,
      };
    },
  };
})));

app.use(router.routes()).use(router.allowedMethods());

export default app;
