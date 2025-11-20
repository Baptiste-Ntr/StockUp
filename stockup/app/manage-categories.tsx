import { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, TrashIcon, EditIcon } from 'lucide-react-native';
import { useCategories, useProducts } from '@/lib/hooks';
import { generateId, CATEGORY_COLORS } from '@/lib/utils';
import type { Category } from '@/lib/types';

export default function ManageCategoriesScreen() {
  const router = useRouter();
  const { categories, addCategory, updateCategory, deleteCategory, reload: reloadCategories } = useCategories();
  const { products, reload: reloadProducts } = useProducts();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Recharger les données quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      reloadCategories();
      reloadProducts();
    }, [reloadCategories, reloadProducts])
  );

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de catégorie.');
      return;
    }

    const newCategory: Category = {
      id: generateId(),
      name: newCategoryName.trim(),
      color: selectedColor,
      createdAt: Date.now(),
    };

    await addCategory(newCategory);
    setNewCategoryName('');
    setIsAdding(false);
    setSelectedColor(CATEGORY_COLORS[0]);
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide.');
      return;
    }

    await updateCategory(id, { name: editingName.trim() });
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    // Vérifier si des produits utilisent cette catégorie
    const productsWithCategory = products.filter(p => p.categoryId === id);
    
    if (productsWithCategory.length > 0) {
      Alert.alert(
        'Catégorie utilisée',
        `La catégorie "${name}" est utilisée par ${productsWithCategory.length} produit(s). Les produits seront sans catégorie après suppression. Continuer ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              await deleteCategory(id);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Confirmer la suppression',
        `Supprimer la catégorie "${name}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              await deleteCategory(id);
            },
          },
        ]
      );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Bouton d'ajout */}
        {!isAdding && (
          <Button
            onPress={() => setIsAdding(true)}
            className="mb-6">
            <Icon as={PlusIcon} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-semibold ml-2">
              Ajouter une catégorie
            </Text>
          </Button>
        )}

        {/* Formulaire d'ajout */}
        {isAdding && (
          <View className="bg-card rounded-lg p-4 mb-6 border border-border">
            <Text className="text-lg font-semibold mb-4">Nouvelle catégorie</Text>
            
            <View className="gap-2 mb-4">
              <Text className="text-sm font-medium">Nom</Text>
              <Input
                placeholder="Nom de la catégorie"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
              />
            </View>

            <View className="gap-2 mb-4">
              <Text className="text-sm font-medium">Couleur</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORY_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full ${selectedColor === color ? 'border-4 border-primary' : 'border-2 border-border'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>

            <View className="flex-row gap-2">
              <Button
                variant="outline"
                onPress={() => {
                  setIsAdding(false);
                  setNewCategoryName('');
                  setSelectedColor(CATEGORY_COLORS[0]);
                }}
                className="flex-1">
                <Text>Annuler</Text>
              </Button>
              <Button
                onPress={handleAddCategory}
                className="flex-1">
                <Text className="text-primary-foreground">Ajouter</Text>
              </Button>
            </View>
          </View>
        )}

        {/* Liste des catégories */}
        <View className="gap-2">
          <Text className="text-lg font-semibold mb-2">
            Catégories ({categories.length})
          </Text>
          
          {categories.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-muted-foreground text-center">
                Aucune catégorie. Ajoutez-en une pour organiser vos produits.
              </Text>
            </View>
          ) : (
            categories.map((category, index) => (
              <View key={category.id}>
                {editingId === category.id ? (
                  <View className="bg-card rounded-lg p-4 border border-border">
                    <Input
                      value={editingName}
                      onChangeText={setEditingName}
                      autoFocus
                      className="mb-3"
                    />
                    <View className="flex-row gap-2">
                      <Button
                        variant="outline"
                        onPress={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="flex-1">
                        <Text>Annuler</Text>
                      </Button>
                      <Button
                        onPress={() => handleUpdateCategory(category.id)}
                        className="flex-1">
                        <Text className="text-primary-foreground">Enregistrer</Text>
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-card rounded-lg p-4">
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    <Text className="flex-1 text-base font-medium">
                      {category.name}
                    </Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                        }}
                        className="p-2">
                        <Icon as={EditIcon} size={20} className="text-muted-foreground" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteCategory(category.id, category.name)}
                        className="p-2">
                        <Icon as={TrashIcon} size={20} className="text-destructive" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {index < categories.length - 1 && <View className="h-2" />}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

