import { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CameraIcon } from 'lucide-react-native';
import { useUser } from '@/lib/hooks';
import { generateId } from '@/lib/utils';
import type { User } from '@/lib/types';

export default function WelcomeScreen() {
  const router = useRouter();
  const { saveUser } = useUser();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Champs requis', 'Veuillez renseigner votre prénom et nom.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const user: User = {
        id: generateId(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        photoUri,
        createdAt: Date.now(),
      };
      
      await saveUser(user);
      
      // Rediriger vers l'app principale
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-20 pb-10">
        {/* Logo et titre */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-foreground mb-2">StockUp</Text>
          <Text className="text-lg text-muted-foreground text-center">
            Bienvenue ! Commençons par créer votre profil
          </Text>
        </View>

        {/* Photo de profil */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={pickImage}
            className="w-32 h-32 rounded-full bg-muted items-center justify-center overflow-hidden border-4 border-primary">
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Icon as={CameraIcon} size={32} className="text-primary mb-2" />
                <Text className="text-sm text-muted-foreground text-center px-4">
                  Ajouter une photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-sm text-muted-foreground mt-3">Optionnel</Text>
        </View>

        {/* Formulaire */}
        <View className="gap-6 mb-8">
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Prénom *</Text>
            <Input
              placeholder="Entrez votre prénom"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Nom *</Text>
            <Input
              placeholder="Entrez votre nom"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Bouton de soumission */}
        <Button
          onPress={handleSubmit}
          disabled={isSubmitting || !firstName.trim() || !lastName.trim()}
          className="w-full">
          <Text className="text-primary-foreground font-semibold">
            {isSubmitting ? 'Création du profil...' : 'Commencer'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}

