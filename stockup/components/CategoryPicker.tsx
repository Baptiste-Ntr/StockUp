import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ChevronDownIcon, PlusIcon } from 'lucide-react-native';
import { useCategories } from '@/lib/hooks';

interface CategoryPickerProps {
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
}

export function CategoryPicker({ selectedCategoryId, onSelectCategory }: CategoryPickerProps) {
  const router = useRouter();
  const { categories, reload: reloadCategories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);

  // Recharger les catégories quand le picker s'ouvre
  useEffect(() => {
    if (isOpen) {
      reloadCategories();
    }
  }, [isOpen, reloadCategories]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const handleSelect = (categoryId: string | undefined) => {
    onSelectCategory(categoryId);
    setIsOpen(false);
  };

  const handleManageCategories = () => {
    setIsOpen(false);
    router.push('/manage-categories');
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between bg-background border border-input rounded-lg px-4 py-3">
        <View className="flex-row items-center flex-1">
          {selectedCategory && (
            <View
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: selectedCategory.color }}
            />
          )}
          <Text className={selectedCategory ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedCategory ? selectedCategory.name : 'Sélectionner une catégorie'}
          </Text>
        </View>
        <Icon as={ChevronDownIcon} size={20} className="text-muted-foreground" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl max-h-[70%]">
            <View className="p-4 border-b border-border">
              <Text className="text-lg font-semibold text-center">Sélectionner une catégorie</Text>
            </View>
            
            <ScrollView className="px-4 py-2">
              {/* Option sans catégorie */}
              <TouchableOpacity
                onPress={() => handleSelect(undefined)}
                className={`py-4 border-b border-border ${!selectedCategoryId ? 'bg-muted' : ''}`}>
                <Text className={!selectedCategoryId ? 'font-semibold' : ''}>
                  Sans catégorie
                </Text>
              </TouchableOpacity>

              {/* Liste des catégories */}
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleSelect(category.id)}
                  className={`flex-row items-center py-4 border-b border-border ${selectedCategoryId === category.id ? 'bg-muted' : ''}`}>
                  <View
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <Text className={selectedCategoryId === category.id ? 'font-semibold' : ''}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Bouton gérer les catégories */}
              <TouchableOpacity
                onPress={handleManageCategories}
                className="flex-row items-center py-4 mt-2">
                <Icon as={PlusIcon} size={20} className="text-primary mr-2" />
                <Text className="text-primary font-semibold">Gérer les catégories</Text>
              </TouchableOpacity>
            </ScrollView>

            <View className="p-4 border-t border-border">
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="bg-muted py-3 rounded-lg items-center">
                <Text className="font-semibold">Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

