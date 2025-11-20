import { useState, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { ImageIcon, XIcon, PlusIcon } from 'lucide-react-native';
import { useProducts } from '@/lib/hooks';
import { generateId } from '@/lib/utils';
import { CategoryPicker } from '@/components/CategoryPicker';
import { VariantManager } from '@/components/VariantManager';
import type { Product, ProductVariant } from '@/lib/types';

export default function AddProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products, addProduct, updateProduct } = useProducts();

  const isEditing = !!params.productId;
  const editingProduct = isEditing ? products.find(p => p.id === params.productId) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: generateId(),
      name: '',
      price: 0,
      stock: 0,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données si en mode édition
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description);
      setCategoryId(editingProduct.categoryId);
      setImages(editingProduct.images);
      setVariants(editingProduct.variants);
    }
  }, [editingProduct]);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limite atteinte', 'Vous pouvez ajouter maximum 5 images.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à la galerie photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Veuillez entrer un nom de produit.');
      return false;
    }

    // Vérifier que toutes les variantes ont un nom
    const emptyVariants = variants.filter(v => !v.name.trim());
    if (emptyVariants.length > 0) {
      Alert.alert('Variantes incomplètes', 'Toutes les variantes doivent avoir un nom.');
      return false;
    }

    // Vérifier que toutes les variantes ont un prix
    const noPriceVariants = variants.filter(v => v.price <= 0);
    if (noPriceVariants.length > 0) {
      Alert.alert('Prix manquants', 'Toutes les variantes doivent avoir un prix supérieur à 0.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditing && editingProduct) {
        // Mode édition
        await updateProduct(editingProduct.id, {
          name: name.trim(),
          description: description.trim(),
          categoryId,
          images,
          variants,
        });
      } else {
        // Mode création
        const newProduct: Product = {
          id: generateId(),
          name: name.trim(),
          description: description.trim(),
          categoryId,
          images,
          variants,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await addProduct(newProduct);
      }

      router.back();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le produit.');
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 py-6 gap-6">
        {/* Images */}
        <View className="gap-2">
          <Text className="text-base font-semibold">Photos du produit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            <View className="flex-row gap-3">
              {/* Bouton ajouter image */}
              <TouchableOpacity
                onPress={pickImage}
                className="w-32 h-32 bg-muted rounded-lg items-center justify-center border-2 border-dashed border-border">
                <Icon as={ImageIcon} size={32} className="text-muted-foreground mb-1" />
                <Text className="text-xs text-muted-foreground">Ajouter</Text>
              </TouchableOpacity>

              {/* Images ajoutées */}
              {images.map((uri, index) => (
                <View key={index} className="w-32 h-32 rounded-lg overflow-hidden relative">
                  <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-destructive rounded-full p-1">
                    <Icon as={XIcon} size={16} className="text-white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
          <Text className="text-xs text-muted-foreground">Maximum 5 photos</Text>
        </View>

        <Separator />

        {/* Nom du produit */}
        <View className="gap-2">
          <Text className="text-base font-semibold">Nom du produit *</Text>
          <Input
            placeholder="ex: Gant de baseball en cuir"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Description */}
        <View className="gap-2">
          <Text className="text-base font-semibold">Description</Text>
          <Input
            placeholder="Description du produit..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
        </View>

        {/* Catégorie */}
        <View className="gap-2">
          <Text className="text-base font-semibold">Catégorie</Text>
          <CategoryPicker
            selectedCategoryId={categoryId}
            onSelectCategory={setCategoryId}
          />
        </View>

        <Separator />

        {/* Variantes */}
        <View className="gap-2">
          <Text className="text-base font-semibold">Variantes *</Text>
          <Text className="text-sm text-muted-foreground mb-2">
            Chaque variante représente une version du produit avec son propre stock et prix.
          </Text>
          <VariantManager variants={variants} onChange={setVariants} />
        </View>

        {/* Boutons d'action */}
        <View className="gap-3 pb-6 pt-4">
          <Button
            onPress={handleSubmit}
            disabled={isSubmitting}>
            <Text className="text-primary-foreground font-semibold">
              {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Enregistrer le produit'}
            </Text>
          </Button>
          
          <Button
            variant="outline"
            onPress={() => router.back()}
            disabled={isSubmitting}>
            <Text>Annuler</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

