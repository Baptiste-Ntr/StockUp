// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { Toaster } from "@/components/ui/sonner";

interface RouterContext {
  queryClient: QueryClient;
}

function RootComponent() {
  return (
    <div className="min-h-screen min-w-screen bg-gray-50">
      <Header />

      <main
        className="min-w-screen h-[calc(100vh-72px-68px)]"
      >
        <Outlet />
        <Toaster />
      </main>

      <footer>
        <Footer />
      </footer>

      <Toaster />

      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-left" />
      )}
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  // ❌ NE PAS mettre requireAuth/requireClub ici !
  // Chaque route doit gérer ses propres vérifications selon ses besoins
  component: RootComponent,
});
