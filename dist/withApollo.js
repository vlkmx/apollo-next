"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = withApollo;
const react_1 = __importDefault(require("react"));
const ssr_1 = require("@apollo/client/react/ssr");
const static_1 = require("react-dom/static");
const apollo_1 = __importDefault(require("./apollo"));
// Gets the display name of a JSX component for dev tools
function getDisplayName(Component) {
    return Component.displayName || Component.name || 'Unknown';
}
function withApollo(client, options = {}) {
    return (Page, pageOptions = {}) => {
        var _a, _b;
        const getInitialProps = Page.getInitialProps;
        const ssr = (_b = (_a = pageOptions.ssr) !== null && _a !== void 0 ? _a : options.ssr) !== null && _b !== void 0 ? _b : false;
        const render = pageOptions.render || options.render;
        const onError = pageOptions.onError || options.onError;
        function WithApollo(_a) {
            var { apollo, apolloState, router } = _a, props = __rest(_a, ["apollo", "apolloState", "router"]);
            const apolloClient = apollo ||
                (0, apollo_1.default)(client, {
                    initialState: apolloState === null || apolloState === void 0 ? void 0 : apolloState.data,
                    router
                });
            if (render) {
                return render({
                    Page: Page,
                    props: Object.assign(Object.assign({}, props), { apollo: apolloClient })
                });
            }
            return react_1.default.createElement(Page, Object.assign({}, props, { apollo: apolloClient }));
        }
        WithApollo.displayName = `WithApollo(${getDisplayName(Page)})`;
        if (getInitialProps || ssr) {
            WithApollo.getInitialProps = async (pageCtx) => {
                const ctx = 'Component' in pageCtx ? pageCtx.ctx : pageCtx;
                const router = 'Component' in pageCtx ? pageCtx.router : undefined;
                const { AppTree } = pageCtx;
                const headers = ctx.req ? ctx.req.headers : {};
                const apollo = (0, apollo_1.default)(client, {
                    ctx,
                    headers,
                    router
                });
                const apolloState = {};
                let pageProps = {};
                if (getInitialProps) {
                    ctx.apolloClient = apollo;
                    pageProps = await getInitialProps(pageCtx);
                }
                if (typeof window === 'undefined') {
                    if (ctx.res && (ctx.res.headersSent || ctx.res.finished)) {
                        return pageProps;
                    }
                    if (ssr) {
                        try {
                            const props = Object.assign(Object.assign({}, pageProps), { apolloState, apollo });
                            const appTreeProps = 'Component' in pageCtx ? props : { pageProps: props };
                            await (0, ssr_1.prerenderStatic)({
                                tree: react_1.default.createElement(AppTree, Object.assign({}, appTreeProps)),
                                context: { client: apollo },
                                renderFunction: static_1.prerenderToNodeStream,
                                ignoreResults: true
                            });
                        }
                        catch (error) {
                            if (onError) {
                                onError(error, ctx);
                            }
                            else {
                                // Prevent Apollo Client GraphQL errors from crashing SSR.
                                if (process.env.NODE_ENV !== 'production') {
                                    console.error('GraphQL error occurred [apollo-next SSR]', error);
                                }
                            }
                        }
                        apolloState.data = apollo.cache.extract();
                    }
                }
                // To avoid calling initApollo() twice in the server we send the Apollo Client as a prop
                // to the component, otherwise the component would have to call initApollo() again but this
                // time without the context, once that happens the following code will make sure we send
                // the prop as `null` to the browser
                apollo.toJSON = () => {
                    return null;
                };
                return Object.assign(Object.assign({}, pageProps), { apolloState,
                    apollo });
            };
        }
        return WithApollo;
    };
}
//# sourceMappingURL=withApollo.js.map