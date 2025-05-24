# apollo-next

Apollo HOC for Next.js.

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
import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache } from '@apollo/client';

export default withApollo(
  ({ initialState }) => {
    return new ApolloClient({
      uri: 'https://mysite.com/graphql',
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
