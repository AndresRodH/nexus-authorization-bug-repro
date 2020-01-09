const { ApolloServer, PubSub } = require("apollo-server-express");
const {
  subscriptionField,
  mutationField,
  makeSchema,
  fieldAuthorizePlugin
} = require("nexus");
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

function mountLatest(app, httpServer) {
  const schema = makeSchema({
    plugins: [fieldAuthorizePlugin()],
    types: [subscription, mutation],
    outputs: {
      schema: path.join(__dirname, "./latest-schema.graphql"),
      typegen: path.join(__dirname, "./latest-types.d.ts")
    }
  });
  const server = new ApolloServer({
    schema,
    subscriptions: {
      path: "/latest"
    }
  });

  console.log("Applying graphql server using nexus@latest on /latest");
  server.applyMiddleware({ app, path: "/latest" });
  console.log("Installing graphql subscription handlers on /latest");
  server.installSubscriptionHandlers(httpServer);
}

module.exports = { mountLatest };
