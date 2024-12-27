import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { NavBar } from '@/components/NavBar';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container mx-auto flex min-h-screen flex-col px-4 pt-24">
        <Outlet />
      </main>
      {process.env.NODE_ENV === 'development' && <TanStackRouterDevtools />}
    </div>
  ),
});
