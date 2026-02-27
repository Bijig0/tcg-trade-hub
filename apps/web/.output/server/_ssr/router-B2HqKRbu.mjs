import { c as createRouter$1, a as createRootRoute, b as createFileRoute, l as lazyRouteComponent, O as Outlet, H as HeadContent, S as Scripts } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { j as jsxRuntimeExports } from "../_chunks/_libs/react.mjs";
import { c as QueryClient } from "../_chunks/_libs/@tanstack/query-core.mjs";
import { Q as QueryClientProvider } from "../_chunks/_libs/@tanstack/react-query.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./index.mjs";
import "../_libs/tiny-warning.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
const globalsCss = "/assets/globals-NOyUyxS9.css";
const JsonLd = ({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "script",
  {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) }
  }
);
const SITE_URL = "https://tcgtradehub.com";
const SITE_NAME = "TCG Trade Hub";
const DEFAULT_OG_IMAGE = "/og-default.png";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1e3
    }
  }
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { className: "min-h-screen bg-background text-foreground antialiased", children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: "Local trading card game marketplace for Pokemon, Magic: The Gathering, and Yu-Gi-Oh collectors."
};
function RootComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RootDocument, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: organizationJsonLd })
  ] }) });
}
const Route$5 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TCG Trade Hub - Trade Cards Locally" },
      {
        name: "description",
        content: "Find local trading card game collectors to buy, sell, and trade Pokemon, MTG, and Yu-Gi-Oh cards. Pre-register now for early access."
      },
      { property: "og:title", content: "TCG Trade Hub - Trade Cards Locally" },
      {
        property: "og:description",
        content: "Find local trading card game collectors to buy, sell, and trade Pokemon, MTG, and Yu-Gi-Oh cards."
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TCG Trade Hub - Trade Cards Locally" },
      {
        name: "twitter:description",
        content: "Find local trading card game collectors to buy, sell, and trade Pokemon, MTG, and Yu-Gi-Oh cards."
      },
      { name: "twitter:image", content: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
      { name: "theme-color", content: "#4f46e5" }
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }
    ]
  }),
  component: RootComponent
});
const $$splitComponentImporter$3 = () => import("./terms-B5Sw5bLD.mjs");
const Route$4 = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: "Terms of Service - TCG Trade Hub"
    }, {
      name: "description",
      content: "Terms of Service for TCG Trade Hub."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./privacy-Bsv8G4ba.mjs");
const Route$3 = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy - TCG Trade Hub"
    }, {
      name: "description",
      content: "Privacy Policy for TCG Trade Hub."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./demo-BYkD9hWA.mjs");
const Route$2 = createFileRoute("/demo")({
  head: () => ({
    meta: [{
      title: "Try the Demo - TCG Trade Hub"
    }, {
      name: "description",
      content: "Experience TCG Trade Hub's chat and trade offer system. Build a counter-offer and see how local card trading works."
    }, {
      property: "og:title",
      content: "Try the Demo - TCG Trade Hub"
    }, {
      property: "og:description",
      content: "Experience TCG Trade Hub's chat and trade offer system. Build a counter-offer and see how local card trading works."
    }, {
      property: "og:image",
      content: `${SITE_URL}${DEFAULT_OG_IMAGE}`
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-CGYkwRrO.mjs");
const Route$1 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "TCG Trade Hub - Trade Pokemon, MTG & Yu-Gi-Oh Cards Locally"
    }, {
      name: "description",
      content: "Find local trading card game collectors to buy, sell, and trade cards face-to-face. No shipping, no scams. Pre-register for early access."
    }, {
      property: "og:title",
      content: "TCG Trade Hub - Trade Pokemon, MTG & Yu-Gi-Oh Cards Locally"
    }, {
      property: "og:description",
      content: "Find local trading card game collectors to buy, sell, and trade cards face-to-face. No shipping, no scams. Pre-register for early access."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    const serverFn = importer ? await importer() : await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
createServerFn().handler(createSsrRpc("7cd112cb9c129b39d307d5bc6528cb82d36a292dffc76c0b1ff6b2cffc0480b9", () => import("./_-B4uPrFSD.mjs").then((m) => m["rpcHandler_createServerFn_handler"])));
const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({
        request
      }) => {
        const {
          handleRPC
        } = await import("./rpcHandler.server-ByL3AL0l.mjs");
        return handleRPC(request);
      }
    }
  }
});
const TermsRoute = Route$4.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$5
});
const PrivacyRoute = Route$3.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$5
});
const DemoRoute = Route$2.update({
  id: "/demo",
  path: "/demo",
  getParentRoute: () => Route$5
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const ApiRpcSplatRoute = Route.update({
  id: "/api/rpc/$",
  path: "/api/rpc/$",
  getParentRoute: () => Route$5
});
const rootRouteChildren = {
  IndexRoute,
  DemoRoute,
  PrivacyRoute,
  TermsRoute,
  ApiRpcSplatRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
const createRouter = () => {
  return createRouter$1({
    routeTree,
    scrollRestoration: true
  });
};
const getRouter = createRouter;
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createRouter,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  JsonLd as J,
  SITE_URL as S,
  router as r
};
