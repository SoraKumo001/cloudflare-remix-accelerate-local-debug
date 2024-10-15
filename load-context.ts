import { AppLoadContext } from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose"> & {
  cf: IncomingRequestCfProperties;
};

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: { cloudflare: Cloudflare };
}) => AppLoadContext;

const hookFetch = () => {
  const that = globalThis as typeof globalThis & {
    __originFetch?: typeof fetch;
  };
  if (that.__originFetch) return;
  const originFetch = globalThis.fetch;
  that.__originFetch = originFetch;

  globalThis.fetch = (async (input: RequestInfo, init?: RequestInit) => {
    const url = new URL(input.toString());
    // If the request is to localhost and is https, change it to http
    if (
      ["127.0.0.1", "localhost"].includes(url.hostname) &&
      url.protocol === "https:"
    ) {
      url.protocol = "http:";
      return originFetch(url.toString(), init);
    }
    return originFetch(input, init);
  }) as typeof fetch;
};

export const getLoadContext: GetLoadContext = ({ context }) => {
  hookFetch();
  return context;
};
