import { View, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, TrashIcon, MinusIcon } from 'lucide-react-native';
import type { ProductVariant } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface VariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function VariantManager({ variants, onChange }: VariantManagerProps) {
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: generateId(),
      name: '',
      price: 0,
      stock: 0,
    };
    onChange([...variants, newVariant]);
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, value: string | number) => {
    const updated = variants.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    );
    onChange(updated);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length === 1) {
      Alert.alert('Erreur', 'Un produit doit avoir au moins une variante.');
      return;
    }
    const filtered = variants.filter(v => v.id !== id);
    onChange(filtered);
  };

  const handleStockChange = (id: string, increment: boolean) => {
    const variant = variants.find(v => v.id === id);
    if (!variant) return;
    
    const newStock = increment ? variant.stock + 1 : Math.max(0, variant.stock - 1);
    handleUpdateVariant(id, 'stock', newStock);
  };

  return (
    <View className="gap-4">
      {variants.map((variant, index) => (
        <View key={variant.id} className="bg-card rounded-lg p-4 border border-border">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-semibold">Variante {index + 1}</Text>
            {variants.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveVariant(variant.id)}
                className="p-1">
                <Icon as={TrashIcon} size={20} className="text-destructive" />
              </TouchableOpacity>
            )}
          </View>

          <View className="gap-3">
            {/* Nom de la variante */}
            <View className="gap-1">
              <Text className="text-sm font-medium">Nom / Taille (ex: Small, Red)</Text>
              <Input
                placeholder="ex: Adulte M, Rouge"
                value={variant.name}
                onChangeText={(text) => handleUpdateVariant(variant.id, 'name', text)}
              />
            </View>

            {/* Prix et Stock sur la même ligne */}
            <View className="flex-row gap-3">
              {/* Prix */}
              <View className="flex-1 gap-1">
                <Text className="text-sm font-medium">Prix (€)</Text>
                <Input
                  placeholder="0.00"
                  value={variant.price > 0 ? variant.price.toString() : ''}
                  onChangeText={(text) => {
                    const price = parseFloat(text) || 0;
                    handleUpdateVariant(variant.id, 'price', price);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Stock */}
              <View className="flex-1 gap-1">
                <Text className="text-sm font-medium">Stock</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => handleStockChange(variant.id, false)}
                    className="bg-muted p-2 rounded-lg">
                    <Icon as={MinusIcon} size={20} />
                  </TouchableOpacity>
                  <Input
                    value={variant.stock.toString()}
                    onChangeText={(text) => {
                      const stock = parseInt(text) || 0;
                      handleUpdateVariant(variant.id, 'stock', stock);
                    }}
                    keyboardType="number-pad"
                    className="flex-1 text-center"
                  />
                  <TouchableOpacity
                    onPress={() => handleStockChange(variant.id, true)}
                    className="bg-muted p-2 rounded-lg">
                    <Icon as={PlusIcon} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}

      {/* Bouton ajouter une variante */}
      <Button
        variant="outline"
        onPress={handleAddVariant}
        className="border-dashed">
        <Icon as={PlusIcon} className="text-primary" />
        <Text className="text-primary font-medium ml-2">Ajouter une variante</Text>
      </Button>
    </View>
  );
}

