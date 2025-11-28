import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, Share, Switch } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { CameraIcon, UserIcon, FolderIcon, TrashIcon, DownloadIcon, TagIcon } from 'lucide-react-native';
import { useUser, useSettings } from '@/lib/hooks';
import { exportData, resetAllData } from '@/lib/storage';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, reload: reloadUser } = useUser();
  const { settings, updateSettings, reload: reloadSettings } = useSettings();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [photoUri, setPhotoUri] = useState(user?.photoUri);

  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [threshold, setThreshold] = useState(settings.lowStockThreshold.toString());

  const [showResetDialog, setShowResetDialog] = useState(false);

  // Recharger les données quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      reloadUser();
      reloadSettings();
    }, [reloadUser, reloadSettings])
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à la galerie photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Champs requis', 'Veuillez renseigner votre prénom et nom.');
      return;
    }

    await updateUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      photoUri,
    });

    setIsEditingProfile(false);
  };

  const handleSaveThreshold = async () => {
    const value = parseInt(threshold);
    if (isNaN(value) || value < 0) {
      Alert.alert('Valeur invalide', 'Veuillez entrer un nombre valide.');
      return;
    }

    await updateSettings({ lowStockThreshold: value });
    setIsEditingThreshold(false);
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const fileName = `stockup-export-${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, data);
      
      await Share.share({
        url: fileUri,
        title: 'Exporter les données StockUp',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    }
  };

  const handleResetData = async () => {
    try {
      await resetAllData();
      setShowResetDialog(false);
      Alert.alert('Données réinitialisées', 'L\'application a été réinitialisée avec succès.', [
        { text: 'OK', onPress: () => router.replace('/(onboarding)/welcome') }
      ]);
    } catch (error) {
      console.error('Error resetting data:', error);
      Alert.alert('Erreur', 'Impossible de réinitialiser les données.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-12 pb-6">
        <Text className="text-3xl font-bold">Paramètres</Text>
      </View>

      <View className="px-4 gap-6">
        {/* Section Profil */}
        <View>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Icon as={UserIcon} size={20} className="text-primary mr-2" />
              <Text className="text-xl font-bold">Profil</Text>
            </View>
            {!isEditingProfile && (
              <TouchableOpacity onPress={() => {
                setIsEditingProfile(true);
                setFirstName(user?.firstName || '');
                setLastName(user?.lastName || '');
                setPhotoUri(user?.photoUri);
              }}>
                <Text className="text-primary font-semibold">Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="bg-card rounded-lg p-4 border border-border">
            {isEditingProfile ? (
              <View className="gap-4">
                {/* Photo */}
                <View className="items-center mb-2">
                  <TouchableOpacity
                    onPress={pickImage}
                    className="relative">
                    {photoUri ? (
                      <Avatar alt="Profile" className="w-24 h-24">
                        <Image source={{ uri: photoUri }} className="w-full h-full" />
                      </Avatar>
                    ) : (
                      <Avatar alt="Profile" className="w-24 h-24 bg-primary">
                        <Icon as={CameraIcon} size={32} className="text-primary-foreground" />
                      </Avatar>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Prénom */}
                <View className="gap-1">
                  <Text className="text-sm font-medium">Prénom</Text>
                  <Input
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Prénom"
                  />
                </View>

                {/* Nom */}
                <View className="gap-1">
                  <Text className="text-sm font-medium">Nom</Text>
                  <Input
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Nom"
                  />
                </View>

                {/* Boutons */}
                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    onPress={() => setIsEditingProfile(false)}
                    className="flex-1">
                    <Text>Annuler</Text>
                  </Button>
                  <Button
                    onPress={handleSaveProfile}
                    className="flex-1">
                    <Text className="text-primary-foreground">Enregistrer</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center">
                {user?.photoUri ? (
                  <Avatar alt={`${user.firstName} ${user.lastName}`} className="w-16 h-16 mr-4">
                    <Image source={{ uri: user.photoUri }} className="w-full h-full" />
                  </Avatar>
                ) : (
                  <Avatar alt={`${user?.firstName} ${user?.lastName}`} className="w-16 h-16 bg-primary mr-4">
                    <Text className="text-primary-foreground text-2xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Text>
                  </Avatar>
                )}
                <View>
                  <Text className="text-xl font-bold">{user?.firstName} {user?.lastName}</Text>
                  <Text className="text-sm text-muted-foreground">Gestionnaire</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <Separator />

        {/* Section Gestion */}
        <View>
          <View className="flex-row items-center mb-4">
            <Icon as={FolderIcon} size={20} className="text-primary mr-2" />
            <Text className="text-xl font-bold">Gestion</Text>
          </View>

          {/* Gérer les catégories */}
          <TouchableOpacity
            onPress={() => router.push('/manage-categories')}
            className="bg-card rounded-lg p-4 mb-3 border border-border flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Icon as={TagIcon} size={20} className="text-muted-foreground mr-3" />
              <Text className="font-medium">Gérer les catégories</Text>
            </View>
            <Text className="text-muted-foreground">›</Text>
          </TouchableOpacity>

          {/* Seuil stock bas */}
          <View className="bg-card rounded-lg p-4 mb-3 border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-medium">Seuil d'alerte stock bas</Text>
              {!isEditingThreshold && (
                <TouchableOpacity onPress={() => {
                  setIsEditingThreshold(true);
                  setThreshold(settings.lowStockThreshold.toString());
                }}>
                  <Text className="text-primary font-semibold">Modifier</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {isEditingThreshold ? (
              <View className="gap-3">
                <Input
                  value={threshold}
                  onChangeText={setThreshold}
                  keyboardType="number-pad"
                  placeholder="10"
                />
                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    onPress={() => setIsEditingThreshold(false)}
                    className="flex-1">
                    <Text>Annuler</Text>
                  </Button>
                  <Button
                    onPress={handleSaveThreshold}
                    className="flex-1">
                    <Text className="text-primary-foreground">Enregistrer</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-2xl font-bold text-primary">{settings.lowStockThreshold}</Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  Alerte affichée quand le stock atteint ou passe sous ce seuil
                </Text>
              </View>
            )}
          </View>

          {/* Stock négatif global */}
          <View className="bg-card rounded-lg p-4 border border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="font-medium">Autoriser stock négatif (global)</Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  Permet les préventes pour tous les produits qui n'ont pas d'option spécifique
                </Text>
              </View>
              <Switch
                value={settings.allowNegativeStockGlobal || false}
                onValueChange={(value) => updateSettings({ allowNegativeStockGlobal: value })}
                trackColor={{ false: '#cbd5e1', true: '#3B82F6' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        <Separator />

        {/* Section Données */}
        <View>
          <View className="flex-row items-center mb-4">
            <Icon as={DownloadIcon} size={20} className="text-primary mr-2" />
            <Text className="text-xl font-bold">Données</Text>
          </View>

          {/* Exporter */}
          <Button
            variant="outline"
            onPress={handleExportData}
            className="w-full mb-3">
            <Icon as={DownloadIcon} className="text-foreground" />
            <Text className="ml-2">Exporter les données (JSON)</Text>
          </Button>

          {/* Réinitialiser */}
          <Button
            variant="destructive"
            onPress={() => setShowResetDialog(true)}
            className="w-full">
            <Icon as={TrashIcon} className="text-destructive-foreground" />
            <Text className="text-destructive-foreground ml-2">Réinitialiser l'application</Text>
          </Button>
        </View>

        {/* Version */}
        <View className="items-center py-6">
          <Text className="text-sm text-muted-foreground">StockUp v1.0.0</Text>
        </View>
      </View>

      {/* Dialog de confirmation reset */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="w-[90%]">
          <DialogHeader>
            <DialogTitle>Réinitialiser l'application ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera toutes vos données : produits, ventes, catégories et paramètres. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                <Text>Annuler</Text>
              </Button>
            </DialogClose>
            <Button variant="destructive" onPress={handleResetData} className="flex-1">
              <Text className="text-destructive-foreground">Réinitialiser</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  );
}

