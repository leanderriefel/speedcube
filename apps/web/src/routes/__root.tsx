import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { ThemeProvider } from "~/components/theme-provider"
import { Toaster } from "~/components/ui/sonner"
import appCss from "~/index.css?url"

export const Route = createRootRouteWithContext()({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <Link
        to="/"
        draggable={false}
        className="rounded-md bg-primary px-6 py-2 text-primary-foreground shadow-md transition-all hover:scale-102 active:scale-98"
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

      <body className="relative isolate">
        <ThemeProvider>
          <Outlet />
          {import.meta.env.DEV ? (
            <>
              <TanStackRouterDevtools position="bottom-right" />
              <ReactQueryDevtools buttonPosition="bottom-left" />
            </>
          ) : null}
          <Toaster position="bottom-center" />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
