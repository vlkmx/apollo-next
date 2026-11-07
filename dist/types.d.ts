import { ApolloClient } from '@apollo/client';
import { IncomingHttpHeaders } from 'http';
import { NextPage, NextPageContext } from 'next';
import { AppContext } from 'next/app';
import { NextRouter } from 'next/router';
export interface WithApolloOptions {
    /** Prefetch queries on the server. Defaults to false; a page can override the global option. */
    ssr?: boolean;
    render?: (props: {
        Page: NextPage<any>;
        props: any;
    }) => any;
    onError?: (error: Error, ctx?: NextPageContext) => void;
}
export interface WithApolloState<TCache> {
    data?: TCache;
}
export interface WithApolloProps<TCache> {
    apolloState: WithApolloState<TCache>;
    apollo: ApolloClient;
    router: NextRouter;
}
export interface InitApolloOptions<TCache> {
    ctx?: NextPageContext;
    headers?: IncomingHttpHeaders;
    router?: NextRouter;
    initialState?: TCache;
}
export type InitApolloClient<TCache> = (options: InitApolloOptions<TCache>) => ApolloClient;
export interface ApolloPageContext<C = any> extends NextPageContext {
    apolloClient: ApolloClient;
}
export interface ApolloAppContext<C = any> extends AppContext {
    ctx: ApolloPageContext<C>;
    AppTree: any;
}
export type ApolloContext<C = any> = ApolloPageContext<C> | ApolloAppContext<C>;
