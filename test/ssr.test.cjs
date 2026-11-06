const assert = require('node:assert/strict');
const { test } = require('node:test');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { ApolloClient, ApolloLink, InMemoryCache, gql } = require('@apollo/client');
const { ApolloProvider, useQuery } = require('@apollo/client/react');
const { getDataFromTree } = require('@apollo/client/react/ssr');
const { Observable } = require('rxjs');
const withApollo = require('../dist').default;
const initApollo = require('../dist/apollo').default;
const query = gql`query Greeting { greeting }`;
function makeClient({ initialState, headers } = {}) {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache().restore(initialState || {}),
    link: new ApolloLink(() => new Observable(observer => {
      observer.next({ data: { greeting: headers?.cookie || 'hello' } });
      observer.complete();
    }))
  });
}
function Page() {
  const { data } = useQuery(query);
  return React.createElement('span', null, data?.greeting || 'loading');
}
const render = ({ Page, props }) => React.createElement(ApolloProvider, { client: props.apollo }, React.createElement(Page, props));

test('SSR prefetches Apollo 4 data with React 19, isolates requests and hydrates serialized cache', async () => {
  const Wrapped = withApollo(makeClient, { getDataFromTree, render })(Page);
  const fetchProps = cookie => Wrapped.getInitialProps({
    req: { headers: { cookie } },
    AppTree: ({ pageProps }) => React.createElement(Wrapped, pageProps)
  });
  const first = await fetchProps('first-user');
  const second = await fetchProps('second-user');
  assert.notEqual(first.apollo, second.apollo);
  assert.equal(first.apolloState.data.ROOT_QUERY.greeting, 'first-user');
  assert.equal(second.apolloState.data.ROOT_QUERY.greeting, 'second-user');
  const serialized = JSON.parse(JSON.stringify(first));
  assert.equal(serialized.apollo, null);
  assert.match(renderToString(React.createElement(Wrapped, serialized)), /first-user/);
});

test('Next App context receives the same client and skips SSR after a redirect', async () => {
  let prefetches = 0;
  const App = () => null;
  App.getInitialProps = async ({ ctx }) => {
    assert.ok(ctx.apolloClient instanceof ApolloClient);
    return { pageProps: { redirected: true } };
  };
  const Wrapped = withApollo(makeClient, { getDataFromTree: async () => { prefetches++; } })(App);
  const result = await Wrapped.getInitialProps({
    Component: Page,
    ctx: { req: { headers: {} }, res: { headersSent: true } },
    AppTree: App
  });
  assert.deepEqual(result, { pageProps: { redirected: true } });
  assert.equal(prefetches, 0);
});

test('SSR reports prefetch errors through onError', async () => {
  const failure = new Error('offline');
  let reported;
  const Wrapped = withApollo(makeClient, {
    getDataFromTree: async () => { throw failure; },
    onError: error => { reported = error; }
  })(Page);
  await Wrapped.getInitialProps({ AppTree: () => null });
  assert.equal(reported, failure);
});

test('browser initialization reuses the client', () => {
  global.window = {};
  try {
    const first = initApollo(makeClient);
    assert.equal(initApollo(makeClient), first);
  } finally {
    delete global.window;
  }
});
