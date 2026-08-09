import { notFound } from "next/navigation";
import { renderTrpcPanel } from "trpc-ui";
import { env } from "@/config/env";
import { appRouter } from "@/server/api/root";

export function GET() {
  if (env.NODE_ENV !== "development") {
    notFound();
  }

  const html = renderTrpcPanel(appRouter, {
    url: "/api/trpc",
    transformer: "superjson",
    meta: {
      title: "EventFinder tRPC Panel",
      description: "Explore and test the tRPC API",
    },
  });

  return new Response(html, {
    headers: { "content-type": "text/html" },
  });
}
