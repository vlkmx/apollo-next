import { ApolloClient } from '@apollo/client';
import { InitApolloClient, InitApolloOptions } from './types';
export default function initApollo<TCache = any>(clientFn: InitApolloClient<TCache>, options?: InitApolloOptions<TCache>): ApolloClient<TCache>;
