import { T as TSS_SERVER_FUNCTION, c as createServerFn } from "./index.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
import "../_chunks/_libs/react.mjs";
import "../_chunks/_libs/@tanstack/react-router.mjs";
import "../_libs/tiny-warning.mjs";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const rpcHandler_createServerFn_handler = createServerRpc({
  id: "7cd112cb9c129b39d307d5bc6528cb82d36a292dffc76c0b1ff6b2cffc0480b9",
  name: "rpcHandler",
  filename: "src/routes/api/rpc/$.tsx"
}, (opts) => rpcHandler.__executeServer(opts));
const rpcHandler = createServerFn().handler(rpcHandler_createServerFn_handler, async ({
  request
}) => {
  const {
    handleRPC
  } = await import("./rpcHandler.server-DIExdlag.mjs");
  return handleRPC(request);
});
export {
  rpcHandler_createServerFn_handler
};
