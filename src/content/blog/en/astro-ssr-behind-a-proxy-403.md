---
title: "Every form returns 403: Astro SSR behind an HTTPS proxy"
description: "Why an Astro site behind Cloudflare Tunnel or Nginx rejects every POST with 403, how to prove it in one request, and the fix that actually works."
pubDate: 2026-09-14
keyword: "astro ssr 403 forbidden post behind proxy"
pillar: "SYS"
relatedService: "SYS-02"
draft: false
---

The site looks perfect. Every page loads, the styling is right, navigation works. And every single form submission returns **403 Forbidden**.

I hit this building [abhazservis.com](https://abhazservis.com/), a business directory running Astro in server mode behind a Cloudflare Tunnel. It will hit anyone who puts an Astro SSR site behind anything that terminates HTTPS — a tunnel, an Nginx with Let's Encrypt, a load balancer. Here is the whole thing, because when it happened the error message told me nothing useful.

## What Astro is doing

Astro has a cross-site request protection called `checkOrigin`. On any form POST it compares the browser's `Origin` header against the origin of the page itself. Same origin, request allowed. Different origin, 403. This is correct behaviour and you want it on.

The problem is how the Node adapter works out "the origin of the page itself". It looks at whether the incoming socket is encrypted — `req.socket.encrypted` — and builds the URL from that.

Behind a proxy, that socket is never encrypted. HTTPS terminates at the proxy; what reaches your server is plain HTTP on a local port. That is the entire point of a proxy.

So the browser sends `Origin: https://your-site.com`, your server computes its own origin as `http://your-site.com`, the strings differ, and the request is rejected. The `X-Forwarded-Proto` header — which exists precisely to say "this arrived over HTTPS" — is not consulted, and there is no configuration option to make it be.

## Proving it in one request

This is what turned a two-hour guess into a five-minute diagnosis. Send the same request twice to the same server, changing only the `Origin` header:

```bash
# Real scheme the browser uses
curl -X POST https://your-site.com/some-form \
  -H "Origin: https://your-site.com" -d 'field=value' -o /dev/null -w '%{http_code}\n'
# → 403

# Same request, http in the Origin header
curl -X POST https://your-site.com/some-form \
  -H "Origin: http://your-site.com" -d 'field=value' -o /dev/null -w '%{http_code}\n'
# → 200
```

If the second one passes, this is your bug. Nothing else produces that exact pattern — same host, same path, same body, one header changed, opposite result.

## The fix

Turn off Astro's check and reimplement it in middleware that reads the forwarded header:

```js
// astro.config.mjs
export default defineConfig({
  output: 'server',
  security: {
    // The Node adapter derives the scheme from req.socket.encrypted and never
    // looks at X-Forwarded-Proto, so behind any TLS-terminating proxy the
    // computed origin is http:// while the browser sends https:// — every POST
    // is rejected. The check lives in src/middleware.ts instead.
    checkOrigin: false,
  },
});
```

```ts
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  if (WRITE_METHODS.has(request.method)) {
    const origin = request.headers.get('origin');
    const proto = request.headers.get('x-forwarded-proto') ?? context.url.protocol.replace(':', '');
    const host = request.headers.get('host');
    if (!origin || origin !== `${proto}://${host}`) {
      return new Response('Forbidden', { status: 403 });
    }
  }
  return next();
});
```

Two things worth keeping: fall back to the raw protocol when the forwarded header is absent, so this still works in local development, and keep rejecting requests with no `Origin` at all rather than letting them through.

## Why you should care even if you are not on a tunnel

Two reasons this is worth knowing rather than just fixing.

**It is not the tunnel's fault.** My first instinct was to blame Cloudflare, and I nearly spent an afternoon on tunnel configuration. The original plan for that project was Nginx with its own certificates, and it would have broken in exactly the same way. Any TLS-terminating proxy produces it.

**The failure is silent in the direction that matters.** Nothing in your logs says "origin mismatch". You get a 403 with no explanation, on a site that otherwise looks healthy, and the people who find it are your users — by not getting a reply to a form they filled in. If your site has a contact form and it is behind a proxy, send yourself a test message today.
