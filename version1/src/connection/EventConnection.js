// @flow

import { connectionDefinitions } from 'graphql-relay';

import EventType from '../type/EventType';

export default connectionDefinitions({
  name: 'Event',
  nodeType: EventType,
});
