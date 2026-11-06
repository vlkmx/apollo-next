# apollo-next

Apollo HOC for the Next.js Pages Router. Version 2 supports Next.js 13–16 and Apollo Client 4. App Router is not supported.

Version 2 requires `@apollo/client@^4`, `graphql`, and `rxjs` in the consuming app. React imports now come from `@apollo/client/react`. The Apollo client itself is no longer generic; the HOC cache-state type parameter remains available.

## How to use

Install the package with npm:

```sh
npm install apollo-next
```

or with yarn:

```sh
yarn add apollo-next
```

```jsx
import withApollo from 'apollo-next';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

export default withApollo(
  ({ initialState }) => {
    return new ApolloClient({
      link: new HttpLink({ uri: 'https://mysite.com/graphql' }),
      cache: new InMemoryCache().restore(initialState || {})
    });
  },
  {
    render: ({ Page, props }) => {
      return (
        <ApolloProvider client={props.apollo}>
          <Page {...props} />
        </ApolloProvider>
      );
    }
  }
);
```
