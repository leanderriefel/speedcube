import type { IncomingMessage, ServerResponse } from "node:http"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"

type ServerModule = typeof import("../../dist/server/server.js")

let serverModulePromise: Promise<ServerModule> | undefined

function getServerModule(): Promise<ServerModule> {
  serverModulePromise ??= import("../../dist/server/server.js")
  return serverModulePromise
}

function getOrigin(req: IncomingMessage) {
  const forwardedProto = req.headers["x-forwarded-proto"]
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto?.split(",")[0]
  if (protocol) return protocol

  const encrypted = (req.connection as any)?.encrypted
  return encrypted ? "https" : "http"
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const { default: server } = await getServerModule()

  const origin = getOrigin(req)
  const host =
    req.headers["x-forwarded-host"] ??
    req.headers.host ??
    "localhost"
  const url = `${origin}://${host}${req.url ?? ""}`

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v)
    } else {
      headers.set(key, value)
    }
  }

  const method = req.method?.toUpperCase() ?? "GET"
  const requestInit: RequestInit = {
    method,
    headers,
  }

  if (method !== "GET" && method !== "HEAD") {
    requestInit.body = req as any
    ;(requestInit as any).duplex = "half"
  }

  const request = new Request(url, requestInit)
  const response = await server.fetch(request)

  res.statusCode = response.status
  res.statusMessage = response.statusText

  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })

  if (method === "HEAD" || !response.body) {
    res.end()
    return
  }

  const nodeStream = Readable.fromWeb(response.body as any)
  await pipeline(nodeStream, res)
}
