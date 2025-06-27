"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initApollo;
let _apolloClient;
function initApollo(clientFn, options) {
    if (!clientFn) {
        throw new Error('[withApollo] the first param is missing and is required to get the ApolloClient');
    }
    if (typeof window === 'undefined') {
        return getClient(clientFn, options);
    }
    if (!_apolloClient) {
        _apolloClient = getClient(clientFn, options);
    }
    return _apolloClient;
}
function getClient(clientFn, options = {}) {
    if (typeof clientFn !== 'function') {
        throw new Error('[withApollo] requires a function that returns an ApolloClient');
    }
    return clientFn(options);
}
//# sourceMappingURL=apollo.js.map