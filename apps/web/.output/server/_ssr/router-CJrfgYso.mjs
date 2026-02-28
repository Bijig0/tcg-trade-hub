import { E as redirect } from "../_chunks/_libs/@tanstack/router-core.mjs";
import { c as createRouter$1, a as createRootRoute, b as createFileRoute, l as lazyRouteComponent, O as Outlet, H as HeadContent, S as Scripts } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { j as jsxRuntimeExports } from "../_chunks/_libs/react.mjs";
import { c as QueryClient } from "../_chunks/_libs/@tanstack/query-core.mjs";
import { Q as QueryClientProvider } from "../_chunks/_libs/@tanstack/react-query.mjs";
import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./index.mjs";
import "../_libs/cookie-es.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/tiny-warning.mjs";
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
const globalsCss = "/assets/globals-DF1AmYMy.css";
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
const Route$6 = createRootRoute({
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
const $$splitComponentImporter$4 = () => import("./terms-B5Sw5bLD.mjs");
const Route$5 = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: "Terms of Service - TCG Trade Hub"
    }, {
      name: "description",
      content: "Terms of Service for TCG Trade Hub."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./privacy-Bsv8G4ba.mjs");
const Route$4 = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy - TCG Trade Hub"
    }, {
      name: "description",
      content: "Privacy Policy for TCG Trade Hub."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./get-started-CZo1IH8f.mjs");
const Route$3 = createFileRoute("/get-started")({
  head: () => ({
    meta: [{
      title: "Get Started - TCG Trade Hub"
    }, {
      name: "description",
      content: "Start trading cards locally in minutes. Chat with a collector, build a trade offer, and sign up for early access."
    }, {
      property: "og:title",
      content: "Get Started - TCG Trade Hub"
    }, {
      property: "og:description",
      content: "Start trading cards locally in minutes. Chat with a collector, build a trade offer, and sign up for early access."
    }, {
      property: "og:image",
      content: `${SITE_URL}${DEFAULT_OG_IMAGE}`
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./demo-BTU5dmpx.mjs");
const Route$2 = createFileRoute("/demo")({
  beforeLoad: () => {
    throw redirect({
      to: "/get-started"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-BtgCxk6W.mjs");
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
createServerFn().handler(createSsrRpc("7cd112cb9c129b39d307d5bc6528cb82d36a292dffc76c0b1ff6b2cffc0480b9", () => import("./_-BW8BqEkS.mjs").then((m) => m["rpcHandler_createServerFn_handler"])));
const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      ANY: async ({
        request
      }) => {
        const {
          handleRPC
        } = await import("./rpcHandler.server-DIExdlag.mjs");
        return handleRPC(request);
      }
    }
  }
});
const TermsRoute = Route$5.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$6
});
const PrivacyRoute = Route$4.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$6
});
const GetStartedRoute = Route$3.update({
  id: "/get-started",
  path: "/get-started",
  getParentRoute: () => Route$6
});
const DemoRoute = Route$2.update({
  id: "/demo",
  path: "/demo",
  getParentRoute: () => Route$6
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$6
});
const ApiRpcSplatRoute = Route.update({
  id: "/api/rpc/$",
  path: "/api/rpc/$",
  getParentRoute: () => Route$6
});
const rootRouteChildren = {
  IndexRoute,
  DemoRoute,
  GetStartedRoute,
  PrivacyRoute,
  TermsRoute,
  ApiRpcSplatRoute
};
const routeTree = Route$6._addFileChildren(rootRouteChildren)._addFileTypes();
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
