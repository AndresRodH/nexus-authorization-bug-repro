const { ApolloServer, PubSub } = require("apollo-server-express");
const { subscriptionField, mutationField, makeSchema } = require("nexus-beta");
const path = require("path");

const pubsub = new PubSub();

const subscription = subscriptionField("foo", {
  type: "String",
  authorize: () => false,
  subscribe: () => pubsub.asyncIterator("baz"),
  resolve: () => "bar"
});

const mutation = mutationField("foo", {
  type: "String",
  resolve() {
    pubsub.publish("baz");
    return "bar";
  }
});

function mountBeta(app, httpServer) {
  const schema = makeSchema({
    types: [subscription, mutation],
    outputs: {
      schema: path.join(__dirname, "./beta-schema.graphql"),
      typegen: path.join(__dirname, "./beta-types.d.ts")
    }
  });
  const server = new ApolloServer({
    schema,
    subscriptions: {
      path: "/beta"
    }
  });

  console.log("Applying graphql server using nexus@0.12.0-beta.14 on /beta");
  server.applyMiddleware({ app, path: "/beta" });
  console.log("Installing graphql subscription handlers on /beta");
  server.installSubscriptionHandlers(httpServer);
}

module.exports = { mountBeta };
