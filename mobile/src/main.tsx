import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import { routeTree } from './routeTree.gen.ts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000,
      gcTime: 5 * 60 * 1000,

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      retry: (failureCount, error: any) => {
        if (error?.code === 401 || error?.code === 403) return false
        return failureCount < 2
      },

      refetchOnWindowFocus: true,

      refetchOnMount: false,

      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
      
      // Configuration globale pour toutes les mutations
      onSuccess: () => {
        // Invalider toutes les queries pour forcer le rafraîchissement
        queryClient.invalidateQueries();
      }
    }
  }
})

const router = createRouter({
  routeTree,
  context: {queryClient},
  defaultPreload: 'intent'
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  </StrictMode>,
)
