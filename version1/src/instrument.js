/**
 * @flow
 */
import { forEachField } from 'graphql-tools';

/**
 * on request start:
 * 1) note the request start time
 * 2) create a per-request place to put state
 *
 * on request end:
 * 3) note the request stop time
 * 4) send the collected data off
 */
const preRequest = (req) => {
  const context = {
    //req,
    startWallTime: +new Date(),
    startHrTime: process.hrtime(),
    resolverCalls: [],
  };
  req._instrumentContext = context;

  console.log('preRequest: ', req._instrumentContext)
};

const postRequest = (req) => {
  const context = req._instrumentContext;

  if (context) {
    context.durationHrTime = process.hrtime(context.startHrTime);
    context.endWallTime = +new Date();

    setImmediate(() => { reportRequestEnd(req) })
  }

  console.log('post: ', context);
};

const reportRequestEnd = (req) => {
  const context = req._instrumentContext;

  if (context) {
    console.log(`wall time: ${context.endWallTime - context.startWallTime}ms`, context.startWallTime, context.endWallTime);
    console.log(`hr time: ${context.durationHrTime[0]}s ${context.durationHrTime[1]/1000000}ms`, context.startHrTime, context.durationHrTime);
    console.log('resolvers: ', context.resolverCalls);
  } else {
    console.log('no context');
  }
};

export const instrumentMiddleware = () => async (ctx, next) => {
  preRequest(ctx.request);

  await next();

  postRequest(ctx.request);
};

// Copied from https://github.com/graphql/graphql-js/blob/v0.7.1/src/execution/execute.js#L1004
function defaultResolveFn(source: any, args, context, { fieldName }) {
  // ensure source is a value for which property access is acceptable.
  if (typeof source === 'object' || typeof source === 'function') {
    const property = source[fieldName];
    if (typeof property === 'function') {
      return source[fieldName](args, context);
    }
    return property;
  }
  return undefined;
}

export const decorateField = (fn, fieldInfo) => {
  const decoratedResolver = (p, a, ctx, resolverInfo) => {
    // setup context and note start time.

    const instrumentContext = ctx && ctx.instrumentContext;

    if (!instrumentContext) {
      console.log('no instrument context');

      return fn(p, a, ctx, resolverInfo);
    }

    // console.log('decorated');

    const resolverReport = {
      startOffset: process.hrtime(instrumentContext.startHrTime),
      fieldInfo,
      resolverInfo,
      resolverContext: ctx,
    };

    // save the report object and log in the end
    instrumentContext.resolverCalls.push(resolverReport);

    const finishRun = () => {
      resolverReport.endOffset = process.hrtime(instrumentContext.startHrTime);
    };

    // Actually run the resolver
    let result;
    try {
      result = fn(p, a, ctx, resolverInfo);
    } catch (e) {
      resolverReport.error = true;
      finishRun();
      throw e;
    }

    // Now process the results of the resolver.
    //
    // Resolver can return any of: null, undefined, string, number,
    // array[thing], or Promise[thing].
    // For primitives and arrays of primitives, fire the report immediately.
    // For Promises, fire when the Promise returns.
    // For arrays containing Promises, fire when the last Promise returns.
    //
    // Wrap in try-catch so bugs in optics-agent are less likely to break an
    // app.
    try {
      if (result === null) {
        resolverReport.resultNull = true;
      } else if (typeof result === 'undefined') {
        resolverReport.resultUndefined = true;
      } else if (typeof result.then === 'function') {
        // single Promise
        //
        // don’t throw from this promise, because it’s not one that the app
        // gets to handle, instead it operates on the original promise.
        result.then(finishRun).catch(() => {
          resolverReport.error = true;
          finishRun();
        });
        // exit early so we do not hit the default return.
        return result;
      } else if (Array.isArray(result)) {
        // array

        // collect the Promises in the array, if any.
        const promises = [];
        result.forEach((value) => {
          if (value && typeof value.then === 'function') {
            promises.push(value);
          }
        });
        // if there are Promises in the array, fire when they are all done.
        if (promises.length > 0) {
          // don’t throw from this promise, because it’s not one that the app
          // gets to handle, instead it operates on the original promise.
          Promise.all(promises).then(finishRun).catch(() => {
            resolverReport.error = true;
            finishRun();
          });
          // exit early so we do not hit the default return.
          return result;
        }
      } else {
        // primitive type. do nothing special, just default return.
      }

      // default return for non-Promise answers
      finishRun();
      return result;
    } catch (e) {
      // safety belt.
      // XXX log here!
      return result;
    }
  };

  return decoratedResolver;
};

/**
 * Schema Wrapping
 *
 * Here we take the executable schema object that graphql-js will
 * execute against and add wrappings. We add both a per-schema
 * wrapping that runs once per query and a per-resolver wrapping that
 * runs around every resolver invocation.
 */
export const instrumentSchema = (schema) => {
  if (schema._instrumented) {
    return schema;
  }
  schema._instrumented = true;

  // add per field instrumentation
  forEachField(schema, (field, typeName, fieldName) => {
    // If there is no resolver for a field, add the default resolve
    // function (which matches the behavior of graphql-js when there
    // is no explicit resolve function). This way we can instrument
    // it.
    if (!field.resolve) {
      field.resolve = defaultResolveFn; // eslint-disable-line no-param-reassign
    }

    field.resolve = decorateField(  // eslint-disable-line no-param-reassign
      field.resolve,
      { typeName, fieldName },
    );
  });

  // add per query instrumentation
  // addSchemaLevelResolveFunction(schema, (root, args, ctx, info) => {
  //   const opticsContext = ctx.opticsContext;
  //   if (opticsContext) {
  //     reportRequestStart(opticsContext, info, ctx);
  //   }
  //   return root;
  // });

  return schema;
};

// //////// Glue ////////


// The graphql `context` object is how we get state into the resolver
// wrappers. For resolver level information gathering to work, the
// user must call `newContext` once per query and place the return
// value in the `opticsContext` field of the graphql-js `context`
// argument.
export const newContext = (req) => {
  let context = req._instrumentContext;
  if (!context) {
    // This happens if the middleware isn't run correctly.

    // XXX this will print once per request! Maybe add a "warn once"
    // feature to print only once.
    console.log('instrument context not found');

    // Fix things up by re-running the pre-request hook. We probably
    // won't correctly send a report as the post-request hook
    // probably won't fire, but this way optics code that assumes a
    // context will run correctly.
    preRequest(req);
    context = req._instrumentContext;
  }

  // This does not really need to be set here. It could be set in
  // preRequest, if we threaded agent through there. Once we do that,
  // we could change the API to not require calling this as a function
  // and instead just ask users to add `req.opticsContext` to their
  // graphql context. See:
  // https://github.com/apollostack/optics-agent-js/issues/46
  // context.agent = agent;

  return context;
};
