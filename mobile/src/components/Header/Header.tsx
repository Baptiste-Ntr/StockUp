import { Link, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authQuery } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  const matchRoute = useMatchRoute();
  const { data: user } = useQuery(authQuery);

  const isAuth =
    matchRoute({ to: "/auth/login", fuzzy: true }) ||
    matchRoute({ to: "/auth/register", fuzzy: true });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isAuth) return null;

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          Lynup-Stock
        </Link>

        <nav className="flex gap-2 items-center">
          {user && (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9 border-2 border-white/20">
                  <AvatarImage src={user.imageUrl} alt={user.name} className="object-cover" />
                  <AvatarFallback className="text-sm font-semibold bg-blue-700 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

