import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQuery } from "@/lib/queries";
import { api, storage } from "@/lib/api";

export const Header = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const matchRoute = useMatchRoute();
  const { data: user } = useQuery(authQuery);

  const handleLogout = async () => {
    await api.auth.logout();
    await storage.remove("defaultClubId");
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    navigate({ to: "/auth/login" });
  };

  const isAuth =
    matchRoute({ to: "/auth/login", fuzzy: true }) ||
    matchRoute({ to: "/auth/register", fuzzy: true });

  if (isAuth) return null;

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          Lynup-Stock
        </Link>

        <nav className="flex gap-2 items-center">
          {user ? (
            <>
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
  );
};

