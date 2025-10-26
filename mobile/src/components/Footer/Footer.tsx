import { useRouter, useMatchRoute } from '@tanstack/react-router';
import { Archive, LayoutDashboard, Settings, Wallet } from 'lucide-react'

export const Footer = () => {

    const router = useRouter();
    const matchRoute = useMatchRoute();

    const footerItems = [
      {
        name: "Dashboard",
        icon: <LayoutDashboard />,
        to: '/dashboard'
      },
      {
        name: "Inventaire",
        icon: <Archive />,
        to: '/inventory',
      },
      {
        name: "Ventes",
        icon: <Wallet />,
        to: '/sales',
      },
      {
        name: "Settings",
        icon: <Settings />,
        to: '/settings'
      }
    ];

    const handleRedirect = (to: string) => {
        router.navigate({ to })
    }

    return (
      <div className="min-w-screen flex justify-between items-center px-7 py-3 fixed bottom-0">
        {footerItems.map((item) => {
            const isActive = matchRoute({ to: item.to, fuzzy: true });
            return (
              <div 
                key={item.to}
                className={`flex flex-col items-center justify-center gap-1 ${isActive && 'text-[#359EFF]'}`} 
                onClick={() => handleRedirect(item.to)}
              >
                  {item.icon}
                  <p className='text-xs'>
                      {item.name}
                  </p>
              </div>
            );
        })}
      </div>
    );
}