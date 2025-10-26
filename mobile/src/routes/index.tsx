import { clubsQuery } from '@/lib/queries'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-middleware'
import { storage } from '@/lib/api'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context: { queryClient } }) => {
    await requireAuth(queryClient)
  },
  loader: async ({ context: { queryClient }}) => {
    // 🚀 Vérifier d'abord le localStorage (rapide)
    const cachedClubId = await storage.get('defaultClubId')
    
    // Si on a un clubId en cache, on redirige directement sans attendre l'API
    if (cachedClubId) {
      throw redirect({
        to: '/dashboard',
      })
    }

    // Sinon, on vérifie via l'API
    try {
      const clubs = await queryClient.ensureQueryData(clubsQuery)

      if (clubs.length === 0) {
        throw redirect({ to: '/clubs/new' })
      }

      // On a trouvé des clubs, on sauvegarde le premier et on redirige
      await storage.set('defaultClubId', clubs[0].id)
      
      throw redirect({
        to: '/dashboard',
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // En cas d'erreur, on redirige vers la création de club
      throw redirect({ to: '/clubs/new' })
    }
  },
  component: () => null
})
