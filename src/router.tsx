import { createRouter, useRouter } from "@tanstack/react-router";
import { lazy } from "react";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a href="/" className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

const LazyDefaultErrorComponent = lazy(() => Promise.resolve({ default: DefaultErrorComponent }));

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: LazyDefaultErrorComponent,
  });
  return router;
};
