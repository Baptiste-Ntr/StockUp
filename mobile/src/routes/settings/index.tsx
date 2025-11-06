import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-middleware'
import { authQuery, userClubQuery } from '@/lib/queries'
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { EditProfileDialog } from '@/components/Settings/EditProfileDialog'
import { 
  User as UserIcon, 
  LogOut, 
  Bell, 
  Moon, 
  Building2,
  Edit
} from 'lucide-react'
import { api, storage } from '@/lib/api'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export const Route = createFileRoute('/settings/')({
  beforeLoad: async ({ context: { queryClient } }) => {
    await requireAuth(queryClient)
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(authQuery)
    try {
      await queryClient.ensureQueryData(userClubQuery)
    } catch {
      // L'utilisateur n'a peut-être pas de club, ce n'est pas grave
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data: user } = useSuspenseQuery(authQuery)
  const { data: userClub } = useSuspenseQuery(userClubQuery)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
  
  // États pour les préférences
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  // Charger les préférences depuis le stockage local
  useEffect(() => {
    storage.get('notifications').then((value) => {
      if (value !== null) setNotifications(value === 'true')
    })
    storage.get('darkMode').then((value) => {
      if (value !== null) setDarkMode(value === 'true')
    })
  }, [])

  const handleSaveProfile = async (data: { name: string; imageUrl?: string }) => {
    try {
      toast.loading("Mise à jour du profil...")
      await api.auth.updateProfile(data)
      
      toast.dismiss()
      toast.success("Profil mis à jour avec succès")
      setIsEditProfileOpen(false)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    } catch {
      toast.dismiss()
      toast.error("Erreur lors de la mise à jour du profil")
    }
  }

  const handleLogout = async () => {
    try {
      toast.loading("Déconnexion en cours...")
      await api.auth.logout()
      queryClient.clear()
      toast.dismiss()
      toast.success("Déconnexion réussie")
      navigate({ to: '/auth/login' })
    } catch {
      toast.dismiss()
      toast.error("Erreur lors de la déconnexion")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      toast.loading("Suppression du compte en cours...")
      // TODO: Implémenter l'API de suppression de compte côté backend
      // await api.auth.deleteAccount()
      
      queryClient.clear()
      toast.dismiss()
      toast.success("Compte supprimé avec succès")
      navigate({ to: '/auth/login' })
    } catch {
      toast.dismiss()
      toast.error("Erreur lors de la suppression du compte")
    }
  }

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value)
    await storage.set('notifications', value.toString())
    toast.success(value ? "Notifications activées" : "Notifications désactivées")
  }

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value)
    await storage.set('darkMode', value.toString())
    // TODO: Implémenter le changement de thème réel
    document.documentElement.classList.toggle('dark', value)
    toast.success(value ? "Thème sombre activé" : "Thème clair activé")
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto h-full">

      {/* Section Profil */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Profil
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.imageUrl} alt={user.name} className="object-cover" />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Section Club */}
      {userClub && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5" />
            Mon Club
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Label className="text-base">Nom du club</Label>
              <p className="font-medium">{userClub.name}</p>
            </div>
            <div className="flex justify-between items-center">
              <Label className="text-base">Code d'invitation</Label>
              <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                {userClub.inviteCode}
              </code>
            </div>
          </div>
        </Card>
      )}

      {/* Section Préférences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Préférences</h2>
        
        <div className="flex flex-col gap-4">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="flex flex-col">
                <Label className="text-base cursor-pointer">Notifications</Label>
                <p className="text-xs text-gray-500">Recevoir les notifications push</p>
              </div>
            </div>
            <Switch 
              checked={notifications}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          <Separator />

          {/* Thème sombre */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-600" />
              <div className="flex flex-col">
                <Label className="text-base cursor-pointer">Thème sombre</Label>
                <p className="text-xs text-gray-500">Activer le mode sombre</p>
              </div>
            </div>
            <Switch 
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          <Separator />
        </div>
      </Card>

      {/* Section Actions dangereuses */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold">Actions</h2>
        
        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="w-full justify-start text-orange-600 border-orange-600 hover:bg-orange-50"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </Card>

      {/* Dialogs */}
      <EditProfileDialog
        open={isEditProfileOpen}
        setOpen={setIsEditProfileOpen}
        user={user}
        onSave={handleSaveProfile}
      />

      {/* Dialog de confirmation de déconnexion */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la déconnexion</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Se déconnecter
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression de compte */}
      <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer définitivement le compte</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
              Êtes-vous absolument sûr de vouloir continuer ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Supprimer définitivement
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
