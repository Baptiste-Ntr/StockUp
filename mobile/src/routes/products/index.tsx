import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-middleware'

export const Route = createFileRoute('/products/')({
  beforeLoad: async ({ context: { queryClient } }) => {
    await requireAuth(queryClient)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Produits</h1>
      <p className="text-gray-600">Page des produits à venir...</p>
    </div>
  )
}
