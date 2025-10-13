import {
  ClientOnly,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import appCss from "~/index.css?url"
import { SessionProvider } from "~/components/session-provider"
import { Spinner } from "~/components/ui/spinner"

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Speedcube App",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootDocument,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <Link
        to="/"
        draggable={false}
        className="bg-primary rounded-md px-6 py-2 text-primary-foreground shadow-md hover:scale-102 active:scale-98 transition-all"
      >
        Go Home
      </Link>
    </div>
  ),
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        <SessionProvider>
          <Outlet />
          {import.meta.env.DEV ? (
            <>
              <TanStackRouterDevtools position="top-right" />
              <ReactQueryDevtools buttonPosition="top-left" />
            </>
          ) : null}
          <Scripts />
        </SessionProvider>
      </body>
    </html>
  )
}
