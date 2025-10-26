// src/routes/__root.tsx
import { createRootRouteWithContext, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQuery, userClubQuery } from "@/lib/queries";
import { api } from "@/lib/api";

interface RouterContext {
  queryClient: QueryClient;
}

function RootComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(authQuery);
  const {data: userClub} = useQuery(userClubQuery);

  const handleLogout = () => {
    api.auth.logout();
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold hover:opacity-90">
            ⚾ Lynup-Stock
          </Link>

          <nav className="flex gap-2 items-center">
            {user ? (
              <>
                <Link
                  to="/products"
                  className="px-4 py-2 rounded-lg transition hover:bg-blue-700"
                  activeProps={{
                    className: "bg-blue-700 font-semibold",
                  }}
                >
                  Produits
                </Link>
                {!userClub && (
                  <Link
                    to="/clubs/new"
                    className="px-4 py-2 rounded-lg transition hover:bg-blue-700"
                    activeProps={{
                      className: "bg-blue-700 font-semibold",
                    }}
                  >
                    Nouveau Club
                  </Link>
                )}
                <span className="text-sm opacity-75 ml-2">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg transition hover:bg-blue-700 ml-2"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded-lg transition hover:bg-blue-700"
                  activeProps={{
                    className: "bg-blue-700 font-semibold",
                  }}
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 rounded-lg transition hover:bg-blue-700"
                  activeProps={{
                    className: "bg-blue-700 font-semibold",
                  }}
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Pages content */}
      <main>
        <Outlet />
      </main>

      {/* DevTools en dev */}
      {import.meta.env.DEV && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
