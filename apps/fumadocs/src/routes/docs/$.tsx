import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { PageTree } from "fumadocs-core/server";
import { docs } from "../../../source.generated";
import { baseOptions } from "../../lib/layout.shared";
import { source } from "../../lib/source";

type LoaderResult = {
  tree: object;
  path: string;
};

const loader = createServerFn({
  method: "GET",
})
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    return {
      tree: source.pageTree as object,
      path: page.path,
    } satisfies LoaderResult;
  });

const clientLoader = createClientLoader(docs.doc, {
  id: "docs",
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        {frontmatter.description ? (
          <DocsDescription>{frontmatter.description}</DocsDescription>
        ) : null}
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

export const Route = createFileRoute("/docs/$")({
  component: DocsRoute,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = (await loader({ data: slugs })) as LoaderResult;
    await clientLoader.preload(data.path);
    return data;
  },
});

function DocsRoute() {
  const data = Route.useLoaderData() as LoaderResult;
  const Content = clientLoader.getComponent(data.path);
  const tree = data.tree as PageTree.Folder;

  return (
    <DocsLayout {...baseOptions()} tree={tree}>
      <Content />
    </DocsLayout>
  );
}
