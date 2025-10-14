import { Link } from "@tanstack/react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";

export function NotFound() {
  return (
    <HomeLayout
      nav={{
        title: "Speedcube Docs",
      }}
      className="py-32"
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
        <h1 className="text-5xl font-semibold text-muted-foreground">404</h1>
        <p className="text-muted-foreground">
          We could not find the page you were looking for.
        </p>
        <Link
          to="/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Back to home
        </Link>
      </div>
    </HomeLayout>
  );
}
