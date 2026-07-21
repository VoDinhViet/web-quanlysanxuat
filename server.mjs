// Production server for the built TanStack Start app.
//
// `vite build` emits dist/client (static assets) and dist/server/server.js — the
// latter default-exports a web-standard `{ fetch(request) => Response }` handler
// that does SSR and serves the server-function RPC endpoints, but does NOT bind a
// port or serve the client assets. This tiny Node server does both: it serves
// files under dist/client directly and forwards everything else to that handler.
//
// Deliberately NOT `vite preview`: preview re-runs the build plugins at startup
// (needs src/, regenerates routeTree.gen.ts) and enforces a Host allowlist that
// breaks behind a reverse proxy. A plain fetch adapter has none of those needs.

import { createServer } from "node:http"
import { createReadStream } from "node:fs"
import { stat } from "node:fs/promises"
import { extname, join, normalize, resolve, sep } from "node:path"
import { Readable } from "node:stream"

const clientDir = new URL("./dist/client/", import.meta.url)
const clientRoot = resolve(clientDir.pathname)
const { default: serverEntry } = await import(
  new URL("./dist/server/server.js", import.meta.url).href
)

const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || "0.0.0.0"

const MIME_TYPES = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
}

// Map a URL path to a real file under dist/client, rejecting path traversal.
async function resolveStaticFile(pathname) {
  const relativePath = normalize(decodeURIComponent(pathname)).replace(
    /^(\.\.(?:[/\\]|$))+/,
    ""
  )
  const filePath = join(clientRoot, relativePath)
  if (filePath !== clientRoot && !filePath.startsWith(clientRoot + sep)) {
    return null
  }
  try {
    const stats = await stat(filePath)
    return stats.isFile() ? filePath : null
  } catch {
    return null
  }
}

function toWebRequest(req, url) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item)
    } else if (value != null) {
      headers.set(key, value)
    }
  }
  const hasBody = req.method !== "GET" && req.method !== "HEAD"
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? "half" : undefined,
  })
}

function sendWebResponse(res, webResponse) {
  for (const [key, value] of webResponse.headers) {
    if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value)
  }
  // Set-Cookie must stay as separate headers, not a comma-joined string.
  const setCookies = webResponse.headers.getSetCookie?.() ?? []
  if (setCookies.length > 0) res.setHeader("set-cookie", setCookies)

  res.writeHead(webResponse.status)
  if (webResponse.body) {
    Readable.fromWeb(webResponse.body).pipe(res)
  } else {
    res.end()
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers.host ?? "localhost"}`
    )

    if (req.method === "GET" || req.method === "HEAD") {
      const filePath = await resolveStaticFile(url.pathname)
      if (filePath) {
        const contentType =
          MIME_TYPES[extname(filePath).toLowerCase()] ??
          "application/octet-stream"
        // Hashed assets are immutable; everything else gets a short cache.
        const cacheControl = url.pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600"
        res.writeHead(200, {
          "content-type": contentType,
          "cache-control": cacheControl,
        })
        if (req.method === "HEAD") {
          res.end()
          return
        }
        createReadStream(filePath).pipe(res)
        return
      }
    }

    const webResponse = await serverEntry.fetch(toWebRequest(req, url))
    sendWebResponse(res, webResponse)
  } catch (error) {
    console.error("[server] request failed:", error)
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" })
    }
    res.end("Internal Server Error")
  }
})

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`)
})
