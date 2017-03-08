# Optimizing Your GraphQL Request Waterfalls

I'll try to implement the 4 versions of optimization introduced in this blog post:
https://dev-blog.apollodata.com/optimizing-your-graphql-request-waterfalls-7c3f3360b051#.bi8w9s6yn by @AndrewIngram

## Query to be optimized

```graphql
query UserEventScreen {
  user(id: "1") {
  	name
    email
    upcomingEvent(first:5) {
      edges {
        node {
          name
          date
          startTime
          endTime
          viewerRsvp
          tags {
            name
          }
          venue {
            name
          }
          attendingFriendsOfViewer(first:4) {
            edges {
              node {
                name
                email
              }
            }
          }
        }
      }
    }
  }
}
```

## Version 1 - Simple but slow

![simple](./assets/simple.png)

## Version 2 - Batching up the nodes

![batchingNodes](./assets/batchingNodes.png)

## Version 3 - Batching up the edges

![batchingEdges](./assets/batchingEdges.png)

## Version 4 - Looking ahead

![lookingAhead](./assets/lookingAhead.png)


