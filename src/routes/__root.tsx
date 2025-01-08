import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Header } from "@/components/layout/header";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
    </div>
  ),
});
