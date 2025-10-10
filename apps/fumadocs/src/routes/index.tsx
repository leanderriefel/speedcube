import { createFileRoute, Link } from "@tanstack/react-router"
import { HomeLayout } from "fumadocs-ui/layouts/home"
import { baseOptions } from "../lib/layout.shared"

export const Route = createFileRoute("/")({
  component: HomeRoute,
})

function HomeRoute() {
  return (
    <HomeLayout {...baseOptions()} className="py-28">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold">Speedcube docs starter</h1>
        <p className="text-muted-foreground">
          Use this space to introduce your project. Your documentation content
          lives in `apps/fumadocs/content`.
        </p>
        <Link
          to="/docs/$"
          params={{ _splat: "" }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Browse docs
        </Link>
      </div>
    </HomeLayout>
  )
}
