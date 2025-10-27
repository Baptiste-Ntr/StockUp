import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-middleware'
import { requireClub } from '@/lib/club-middleware'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context: { queryClient } }) => {
    // Vérifier d'abord l'authentification
    await requireAuth(queryClient);
    // Puis vérifier qu'il a un club
    await requireClub(queryClient);
    // Si tout est OK, rediriger vers le dashboard
    throw redirect({ to: '/dashboard' });
  },
  component: () => null
})
