# Field Authorize Plugin bug

[Refer to issue](https://github.com/prisma-labs/nexus/issues/358).

Field authorize plugin is checking for authorization on publish rather on subscribe on subscriptions (nexus@0.12.0-rc.5), which was the case for beta versions (nexus@0.12.0-beta.14).

This reproduction repo starts an Apollo server with subscriptions on two endpoints, one for the beta version and one for the latest version with authorization set to fail.

## Steps to reproduce

1. Install dependencies by running `yarn`
2. Start server with `yarn start`

### Beta

Navigate to `http://localhost:3000/beta` to access the playground and run the following subscription:

```graphql
subscription {
  foo
}
```

Subscription fails right away

### Latest

Navigate to `http://localhost:3000/latest` to access the playground and run the following subscription:

```graphql
subscription {
  foo
}
```

Susbcription starts. Open a new tab and run the following mutation:

```graphql
mutation {
  foo
}
```

Subscription errors due to not being authenticated.
