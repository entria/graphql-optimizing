import ConnectionFromMongoCursor from './ConnectionFromMongoCursor';

export const getConnection = (ids, loader) => {
  const edges = ids.map((id, index) => ({
    cursor: ConnectionFromMongoCursor.offsetToCursor(index),
    node: loader(id),
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];

  return {
    edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      // TODO - fix this
      hasPreviousPage: false,
      hasNextPage: false
    },
  };
}
