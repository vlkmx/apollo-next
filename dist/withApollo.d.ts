import { NextPage } from 'next';
import App from 'next/app';
import { ApolloContext, InitApolloClient, WithApolloOptions, WithApolloProps } from './types';
export default function withApollo<TCache = any>(client: InitApolloClient<TCache>, options?: WithApolloOptions): (Page: NextPage<any> | typeof App, pageOptions?: WithApolloOptions) => Promise<{
    ({ apollo, apolloState, router, ...props }: Partial<WithApolloProps<TCache>>): any;
    displayName: string;
    getInitialProps(pageCtx: ApolloContext): Promise<{}>;
}>;
