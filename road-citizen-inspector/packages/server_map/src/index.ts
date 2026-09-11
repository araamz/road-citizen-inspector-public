// packages/server-map/src/index.ts
// Tiny, typed “server map” with env fallbacks + validation.

export type ServiceKey =
  | "RCI_SESSION_API"
  | "RCI_UPLINK_API"
  | "RCI_BATCH_API"
  | "APP_RABBITMQ"
  | "APP_REDIS"
  | "RCI_GATEWAT_API"
export type GatewayKey = "APP_EXT_NGINX";

export type UrlString = string & { readonly __brand: "UrlString" };

type EndpointDef = {
  /** Environment variable to read from (e.g., SESSION_SRV_ADDRESS) */
  env: string;
  /** Default to use if the env var is unset/empty */
  default?: string;
  /** If true and missing, throw (even if default missing) */
  required?: boolean;
};

type MapDef<TKeys extends string> = Record<TKeys, EndpointDef>;

export type ServerMap<TServices extends string, TGates extends string> = {
  services: Record<TServices, UrlString>;
  gateways: Record<TGates, UrlString>;
};

function toUrlString(v: string): UrlString {
  // Light runtime guard; catches obvious typos early.
  try {
    // eslint-disable-next-line no-new
    new URL(v);
    return v as UrlString;
  } catch {
    throw new Error(`Invalid URL: ${v}`);
  }
}

function readFromEnv(envName: string, env: Record<string, string | undefined>) {
  const raw = env[envName];
  return (raw && raw.trim().length > 0) ? raw.trim() : undefined;
}

function realize<TKeys extends string>(
  defs: MapDef<TKeys>,
  env: Record<string, string | undefined>,
): Record<TKeys, UrlString> {
  const out = {} as Record<TKeys, UrlString>;
  for (const key of Object.keys(defs) as TKeys[]) {
    const { env: envName, default: fallback, required } = defs[key];
    const val = readFromEnv(envName, env) ?? fallback;
    if (!val) {
      if (required) {
        throw new Error(`Missing required endpoint "${String(key)}" (env ${envName})`);
      }
      throw new Error(
        `No value for endpoint "${String(key)}" (env ${envName}) and no default provided`,
      );
    }
    out[key] = toUrlString(val);
  }
  return Object.freeze(out);
}

/**
 * Build a ServerMap. Works in Node (process.env) or with a provided env object
 * (e.g., from Vite/Cloudflare Workers adapters).
 */
export function createServerMap<
  TServices extends string,
  TGates extends string,
>(opts: {
  services: MapDef<TServices>;
  gateways: MapDef<TGates>;
  /** Optional; defaults to process.env in Node contexts */
  env?: Record<string, string | undefined>;
}): ServerMap<TServices, TGates> {
  const env = opts.env ?? (typeof process !== "undefined" ? (process.env as Record<string, string | undefined>) : {});
  const services = realize(opts.services, env);
  const gateways = realize(opts.gateways, env);
  return Object.freeze({ services, gateways });
}