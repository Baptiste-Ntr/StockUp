import { api, storage } from '@/lib/api'
import type { CreateClubDto } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuth } from '@/lib/auth-middleware'

export const Route = createFileRoute('/clubs/new')({
  beforeLoad: async ({ context: { queryClient } }) => {
    await requireAuth(queryClient)
  },
  component: RouteComponent,
})

function RouteComponent() {

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [clubName, setClubName] = useState<string>("")

  const createClubMutation = useMutation({
    mutationFn: (data: CreateClubDto) => api.clubs.create(data),

    onSuccess: async (newClub) => {
      console.log("✅ Club créé:", newClub);

      queryClient.invalidateQueries({queryKey: ['clubs']})

      await storage.set('defaultClubId', newClub.id)

      navigate({
        to: '/dashboard',
        search: {clubId: newClub.id}
      })
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("❌ Erreur création club:", error);
      alert(`Erreur: ${error.message || "Impossible de créer le club"}`);
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim()) {
      alert("Le nom du club est requis");
      return;
    }
    createClubMutation.mutate({ 
      name: clubName.trim(), 
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase() 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Créer un club ⚾</h1>
          <p className="text-gray-600 mt-2">
            Commencez par créer votre premier club
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="clubName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom du club
            </label>
            <input
              id="clubName"
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Baseball Club de Paris"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
              disabled={createClubMutation.isPending}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={createClubMutation.isPending || !clubName.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {createClubMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Création...
              </span>
            ) : (
              "Créer mon club"
            )}
          </button>
        </form>

        {/* Afficher erreur si échec */}
        {createClubMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(createClubMutation.error as any)?.message ||
                "Une erreur est survenue"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
