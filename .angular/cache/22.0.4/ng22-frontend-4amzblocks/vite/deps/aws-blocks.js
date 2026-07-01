import {
  __spreadValues
} from "./chunk-H2SRQSE4.js";

// node_modules/@aws-blocks/core/dist/errors.js
var ApiError = class extends Error {
  /** HTTP status code. */
  status;
  /**
   * Whether the caller can retry the same action without restarting the
   * broader flow. Semantically meaningful for multi-step state machines
   * like auth challenges: the same session token / envelope can be reused
   * with a corrected input (wrong MFA code, wrong password on re-prompt)
   * when `retriable === true`; non-retriable errors (expired session,
   * tampered envelope, too-many-attempts lockouts) require restarting the
   * flow. Defaults to `false` when unspecified.
   */
  retriable;
  constructor(message, status, options) {
    super(message, options?.cause ? { cause: options.cause } : void 0);
    this.name = options?.name ?? "ApiError";
    this.status = status;
    this.retriable = options?.retriable ?? false;
  }
};

// node_modules/@aws-blocks/core/dist/rpc.js
var VERSION = "2.0";
var _nextId = 1;
function encodeRpcRequest(apiNamespace, method, args) {
  return JSON.stringify({
    jsonrpc: VERSION,
    method: `${apiNamespace}.${method}`,
    params: args,
    id: _nextId++
  });
}
function decodeRpcResponse(body) {
  const rpc = body;
  if (rpc.error) {
    const { code, message, data } = rpc.error;
    const status = code > 0 ? code : 500;
    throw new ApiError(message, status, __spreadValues(__spreadValues({}, data?.name ? { name: data.name } : {}), data?.retriable === true ? { retriable: true } : {}));
  }
  return rpc.result;
}

// node_modules/@aws-blocks/core/dist/client/index.js
var IS_SSR = typeof window === "undefined";
function getSsrCookies() {
  if (!IS_SSR)
    return void 0;
  if (typeof globalThis === "undefined")
    return void 0;
  const store = globalThis.__BLOCKS_REQUEST_COOKIES_STORE__;
  if (!store || typeof store.getStore !== "function")
    return void 0;
  return store.getStore();
}
var API_URL = null;
var apiUrlPromise = null;
async function getApiUrl() {
  if (API_URL)
    return API_URL;
  if (apiUrlPromise)
    return apiUrlPromise;
  apiUrlPromise = resolveApiUrl().catch((err) => {
    apiUrlPromise = null;
    throw err;
  });
  return apiUrlPromise;
}
async function resolveApiUrl() {
  if (API_URL)
    return API_URL;
  function isInvalidUrl(url) {
    if (!url || typeof url !== "string" || !url.trim())
      return true;
    if (url === "undefined" || url.startsWith("undefined"))
      return true;
    if (url.startsWith("/"))
      return false;
    try {
      const parsed = new URL(url);
      return parsed.hostname === "undefined" || parsed.pathname === "/undefined" || parsed.pathname.startsWith("/undefined/");
    } catch {
      return true;
    }
  }
  function validateAndCache(url, source) {
    if (!url || typeof url !== "string" || isInvalidUrl(url)) {
      throw new Error(`Blocks API URL is not configured (source: ${source}). Ensure BLOCKS_API_URL environment variable is set or config.json is deployed. Run with --conditions=cdk during CDK synthesis.`);
    }
    API_URL = url;
    return url;
  }
  if (typeof process !== "undefined" && process.env?.BLOCKS_API_URL) {
    const url = process.env.BLOCKS_API_URL;
    if (/\$\{Token\[/.test(url)) {
      throw new Error("Blocks API URL contains unresolved CDK tokens. This usually means a Server Component is being statically prerendered during `next build` inside `cdk deploy`.\nFix: add `export const dynamic = 'force-dynamic';` to any page that calls the Blocks API so Next.js skips prerendering it.");
    }
    const validated = validateAndCache(url, "env BLOCKS_API_URL");
    console.log("[Blocks] Using API (env BLOCKS_API_URL):", validated);
    return validated;
  }
  if (typeof process !== "undefined" && process.env?.BLOCKS_CONFIG) {
    try {
      const config = JSON.parse(process.env.BLOCKS_CONFIG);
      const validated = validateAndCache(config.apiUrl, "env BLOCKS_CONFIG");
      console.log("[Blocks] Using API (env BLOCKS_CONFIG):", validated);
      return validated;
    } catch {
    }
  }
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import(
        /* webpackIgnore: true */
        "./node_fs-VCKRO2HC.js"
      );
      const config = JSON.parse(fs.readFileSync(".blocks-sandbox/config.json", "utf-8"));
      const validated = validateAndCache(config.apiUrl, "config.json file");
      console.log("[Blocks] Using API (config.json file):", validated);
      return validated;
    } catch {
    }
  }
  try {
    const response = await fetch("/.blocks-sandbox/config.json");
    if (response.ok) {
      const config = await response.json();
      const validated = validateAndCache(config.apiUrl, "config.json fetch");
      console.log("[Blocks] Using API (config.json fetch):", validated);
      return validated;
    }
  } catch {
  }
  throw new Error("Blocks API URL not configured. Ensure:\n1. You ran `npm run deploy` (deploys config.json)\n2. SSR Lambda has BLOCKS_API_URL env var, OR\n3. config.json exists at /.blocks-sandbox/config.json");
}
var middlewares = [];
function registerMiddleware(middleware) {
  middlewares.push(middleware);
}
async function processRequest(request) {
  for (const mw of middlewares) {
    if (mw.onRequest) {
      const result = await mw.onRequest(request);
      if (result)
        request = result;
    }
  }
  return request;
}
function processResponse(data) {
  for (const mw of middlewares) {
    if (mw.onResponse) {
      data = mw.onResponse(data);
    }
  }
  return data;
}
function ApiNamespaceClient(name, options) {
  const urlOverride = options?.url;
  return new Proxy({}, {
    get(target, method) {
      if (typeof method === "symbol")
        return void 0;
      return async (...args) => {
        const apiUrl = urlOverride ?? await getApiUrl();
        let request = {
          apiNamespace: name,
          method,
          args,
          headers: { "Content-Type": "application/json" }
        };
        request = await processRequest(request);
        const ssrCookies = getSsrCookies();
        if (ssrCookies) {
          const existingKey = "Cookie" in request.headers ? "Cookie" : "cookie" in request.headers ? "cookie" : null;
          const existing = existingKey ? request.headers[existingKey] : void 0;
          if (existingKey && existingKey !== "Cookie") {
            delete request.headers[existingKey];
          }
          if (existing) {
            const existingNames = new Set(existing.split(";").filter(Boolean).map((c) => c.trim().split("=")[0]));
            const newCookies = ssrCookies.split(";").filter(Boolean).filter((c) => !existingNames.has(c.trim().split("=")[0])).join("; ");
            request.headers["Cookie"] = newCookies ? `${existing}; ${newCookies}` : existing;
          } else {
            request.headers["Cookie"] = ssrCookies;
          }
        }
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: request.headers,
          credentials: "include",
          body: encodeRpcRequest(request.apiNamespace, request.method, request.args)
        });
        const rpcBody = await response.json();
        const result = decodeRpcResponse(rpcBody);
        return processResponse(result);
      };
    }
  });
}

// node_modules/@aws-blocks/bb-realtime/dist/mock-middleware.js
var connections = /* @__PURE__ */ new Map();
var MAX_RECONNECT = 5;
var MAX_DELAY_MS = 3e4;
function getOrCreateConnection(wsUrl) {
  let conn = connections.get(wsUrl);
  if (!conn) {
    conn = {
      ws: void 0,
      isConnected: false,
      reconnectAttempts: 0,
      subscriptions: /* @__PURE__ */ new Map(),
      channelTokens: /* @__PURE__ */ new Map(),
      pendingSubs: [],
      pendingMessages: [],
      pendingEstablished: /* @__PURE__ */ new Map(),
      disconnectHandlers: /* @__PURE__ */ new Set()
    };
    connections.set(wsUrl, conn);
  }
  return conn;
}
function doConnect(wsUrl) {
  const conn = getOrCreateConnection(wsUrl);
  try {
    conn.ws = new WebSocket(wsUrl);
    conn.ws.onopen = () => {
      conn.isConnected = true;
      conn.reconnectAttempts = 0;
      for (const ch of conn.subscriptions.keys()) {
        conn.ws.send(JSON.stringify({ action: "subscribe", channel: ch, token: conn.channelTokens.get(ch) }));
      }
      for (const { channel, token } of conn.pendingSubs) {
        if (!conn.subscriptions.has(channel)) {
          conn.ws.send(JSON.stringify({ action: "subscribe", channel, token }));
        }
      }
      conn.pendingSubs.length = 0;
      for (const msg of conn.pendingMessages) {
        conn.ws.send(msg);
      }
      conn.pendingMessages.length = 0;
    };
    conn.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "subscribe_success" && data.channel) {
          const pending = conn.pendingEstablished.get(data.channel);
          if (pending) {
            pending.forEach((p) => p.resolve());
            conn.pendingEstablished.delete(data.channel);
          }
        } else if (data.type === "error" && data.channel) {
          const pending = conn.pendingEstablished.get(data.channel);
          if (pending) {
            const err = new Error(data.message || "Subscription rejected");
            err.name = "ConnectionFailedException";
            pending.forEach((p) => p.reject(err));
            conn.pendingEstablished.delete(data.channel);
          }
          conn.subscriptions.delete(data.channel);
          conn.channelTokens.delete(data.channel);
        } else if (data.type === "message" && data.channel) {
          const handlers = conn.subscriptions.get(data.channel);
          if (handlers) {
            handlers.forEach((h) => {
              try {
                h(data.payload);
              } catch (e) {
                console.error("[Realtime] Handler error:", e);
              }
            });
          }
        }
      } catch (e) {
        console.error("[Realtime] Parse error:", e);
      }
    };
    conn.ws.onclose = () => {
      conn.isConnected = false;
      conn.disconnectHandlers.forEach((h) => {
        try {
          h("unknown");
        } catch {
        }
      });
      conn.disconnectHandlers.clear();
      scheduleReconnect(wsUrl);
    };
    conn.ws.onerror = (e) => {
      console.error("[Realtime] WS error:", e);
      conn.disconnectHandlers.forEach((h) => {
        try {
          h("error");
        } catch {
        }
      });
    };
  } catch (e) {
    console.error("[Realtime] Connection error:", e);
    scheduleReconnect(wsUrl);
  }
}
function scheduleReconnect(wsUrl) {
  const conn = getOrCreateConnection(wsUrl);
  if (conn.reconnectAttempts >= MAX_RECONNECT)
    return;
  conn.reconnectAttempts++;
  const delay = Math.min(1e3 * 2 ** (conn.reconnectAttempts - 1), MAX_DELAY_MS);
  conn.reconnectTimer = setTimeout(() => doConnect(wsUrl), delay);
}
function ensureConnected(wsUrl) {
  const conn = getOrCreateConnection(wsUrl);
  if (conn.ws && (conn.isConnected || conn.reconnectAttempts < MAX_RECONNECT))
    return;
  if (conn.reconnectAttempts >= MAX_RECONNECT) {
    conn.reconnectAttempts = 0;
    conn.ws = void 0;
  }
  doConnect(wsUrl);
}
function subscribeTo(wsUrl, channel, handler, token, onDisconnect) {
  const conn = getOrCreateConnection(wsUrl);
  ensureConnected(wsUrl);
  if (onDisconnect)
    conn.disconnectHandlers.add(onDisconnect);
  let establishedResolve;
  let establishedReject;
  const established = new Promise((resolve, reject) => {
    establishedResolve = resolve;
    establishedReject = reject;
  });
  if (!conn.subscriptions.has(channel)) {
    conn.subscriptions.set(channel, /* @__PURE__ */ new Set());
    conn.channelTokens.set(channel, token);
    const subMsg = JSON.stringify({ action: "subscribe", channel, token });
    if (conn.isConnected && conn.ws?.readyState === WebSocket.OPEN) {
      conn.ws.send(subMsg);
    } else {
      conn.pendingSubs.push({ channel, token });
    }
  }
  if (!conn.pendingEstablished.has(channel)) {
    conn.pendingEstablished.set(channel, []);
  }
  conn.pendingEstablished.get(channel).push({ resolve: establishedResolve, reject: establishedReject });
  conn.subscriptions.get(channel).add(handler);
  return {
    unsubscribe() {
      if (onDisconnect) {
        try {
          onDisconnect("client");
        } catch {
        }
        conn.disconnectHandlers.delete(onDisconnect);
      }
      const handlers = conn.subscriptions.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          conn.subscriptions.delete(channel);
          conn.channelTokens.delete(channel);
          if (conn.isConnected && conn.ws?.readyState === WebSocket.OPEN) {
            conn.ws.send(JSON.stringify({ action: "unsubscribe", channel }));
          }
        }
      }
    },
    established,
    connection: conn.ws
  };
}
function isRealtimeDescriptor(data) {
  return typeof data === "object" && data !== null && data.__blocks === "realtime/channel" && typeof data.wsUrl === "string";
}
function hydrate(data) {
  if (isRealtimeDescriptor(data)) {
    const { channel, wsUrl, token } = data;
    return {
      subscribe(handlerOrOptions) {
        const handler = typeof handlerOrOptions === "function" ? handlerOrOptions : handlerOrOptions.onMessage;
        const onDisconnect = typeof handlerOrOptions === "function" ? void 0 : handlerOrOptions.onDisconnect;
        return subscribeTo(wsUrl, channel, handler, token, onDisconnect);
      }
    };
  }
  if (Array.isArray(data))
    return data.map(hydrate);
  if (typeof data === "object" && data !== null) {
    const result = {};
    for (const [k, v] of Object.entries(data))
      result[k] = hydrate(v);
    return result;
  }
  return data;
}
registerMiddleware({ onResponse: hydrate });

// aws-blocks/client.js
var api = ApiNamespaceClient("api");
var authApi = ApiNamespaceClient("authApi");
var generateClient = (config) => ({
  api: ApiNamespaceClient("api", config),
  authApi: ApiNamespaceClient("authApi", config)
});
export {
  api,
  authApi,
  generateClient
};
//# sourceMappingURL=aws-blocks.js.map
