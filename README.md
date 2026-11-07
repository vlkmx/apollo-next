# apollo-next

Apollo HOC for the Next.js **Pages Router**. Version 3 supports Next.js 16, React 19, Apollo Client 4 and Node.js 20.9+. App Router is not supported.

Install `apollo-next`, `@apollo/client` and `graphql` in the consuming app.

## Usage

Wrap your custom `pages/_app.tsx` and enable query prefetching with `ssr: true`:

```tsx
import type { AppProps } from 'next/app';
import withApollo from 'apollo-next';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

function MyApp({ Component, pageProps, apollo }: AppProps & { apollo: ApolloClient }) {
  return (
    <ApolloProvider client={apollo}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default withApollo(({ initialState, headers }) => new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: new HttpLink({
    uri: 'https://mysite.com/graphql',
    headers: headers?.cookie ? { cookie: headers.cookie } : undefined
  }),
  cache: new InMemoryCache().restore(initialState || {})
}))(MyApp, { ssr: true });
```

Only forward cookies to your own trusted GraphQL endpoint.

SSR uses Apollo's `prerenderStatic` with React's `prerenderToNodeStream`. It supports `useQuery` and suspense queries, fills the Apollo cache, and leaves final HTML rendering to Next.js. Each server request gets its own client; the browser reuses a client and restores the serialized cache.

## Options

Options can be passed to `withApollo(factory, options)` or the returned wrapper `(Page, options)`. Per-page options override global options.

- `ssr`: prefetch queries on the server; defaults to `false`. A page can set `false` to override global `true`.
- `render`: optional render callback receiving `{ Page, props }`, useful for providing an `ApolloProvider` around an individual page.
- `onError`: receives SSR errors and the Next.js page context. Without a handler, errors are logged in development and final rendering continues.

The client factory receives `initialState`, `ctx`, `headers`, and `router` when available. Existing `getInitialProps` receives the client as `ctx.apolloClient` (or `appContext.ctx.apolloClient` for a custom App).

Enabling SSR installs `getInitialProps`. On a custom App this disables Next.js Automatic Static Optimization for pages without `getStaticProps`. This Pages Router integration does not provide App Router streaming or React Server Components support. For App Router, use `@apollo/client-integration-nextjs`.

## Migration from version 2

Version 3 drops Next.js 13–15 and React 16–18 support. Upgrade to Next.js 16 and React 19 first.

Remove the `getDataFromTree` import and callback, including any custom `prerenderStatic` adapter, and replace the option:

```tsx
// Version 2
withApollo(MyApp, { getDataFromTree });

// Version 3 (withApollo is the wrapper returned by your configured factory)
withApollo(MyApp, { ssr: true });
```

SSR remains opt-in. Client factory, cache serialization, `render`, and `onError` remain available. No GraphQL schema regeneration is needed for this migration.

## Validation

Run `yarn test` to build the package and test SSR prefetching, suspense, request isolation, cache restoration, redirects, error handling, and option overrides.
