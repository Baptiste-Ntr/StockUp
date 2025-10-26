import { clubsQuery } from '@/lib/queries'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-middleware'
import { storage } from '@/lib/api'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context: { queryClient } }) => {
    await requireAuth(queryClient)
  },
  loader: async ({ context: { queryClient }}) => {
    try {
      const clubs = await queryClient.ensureQueryData(clubsQuery)

      console.log(clubs)

      if(clubs.length === 0) {
        throw redirect({to: '/clubs/new'})
      }

      const defaultClubId = await storage.get('defaultClubId')

      console.log(defaultClubId)

      throw redirect({
        to: '/products',
        search: {clubId: defaultClubId}
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw redirect({to: '/clubs/new'})
    }
  },
  component: () => null
})
