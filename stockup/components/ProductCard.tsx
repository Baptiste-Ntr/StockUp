import { View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { EditIcon, TrashIcon, PackageIcon } from 'lucide-react-native';
import type { Product, Category } from '@/lib/types';
import { formatPrice, getStockStatus } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  category?: Category;
  lowStockThreshold: number;
  onDelete: () => void;
}

export function ProductCard({ product, category, lowStockThreshold, onDelete }: ProductCardProps) {
  const router = useRouter();

  // Calculer le stock total et vérifier si une variante est en stock bas
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const totalStockStatus = getStockStatus(totalStock, lowStockThreshold);
  
  // Vérifier si au moins une variante est en stock bas
  const hasLowStockVariant = product.variants.some(v => {
    const variantStatus = getStockStatus(v.stock, lowStockThreshold);
    return variantStatus === 'low' || variantStatus === 'out';
  });
  
  // Le statut affiché est le pire des deux
  const stockStatus = totalStockStatus === 'out' || hasLowStockVariant && totalStock === 0
    ? 'out'
    : totalStockStatus === 'low' || hasLowStockVariant
    ? 'low'
    : 'ok';

  // Calculer le prix min et max
  const prices = product.variants.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay = minPrice === maxPrice 
    ? formatPrice(minPrice)
    : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  // Calculer la valeur totale du stock
  const totalValue = product.variants.reduce((sum, v) => sum + (v.price * v.stock), 0);

  const handleEdit = () => {
    router.push(`/add-product?productId=${product.id}`);
  };

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-card">
      <View className="flex-row">
        {/* Image */}
        <View className="h-24 w-24 items-center justify-center bg-muted">
          {product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[0] }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Icon as={PackageIcon} size={32} className="text-muted-foreground" />
          )}
        </View>

        {/* Contenu */}
        <View className="flex-1 gap-1 p-3">
          {/* Nom et catégorie */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold" numberOfLines={1}>
                {product.name}
              </Text>
              {category && (
                <View className="mt-1 flex-row items-center">
                  <View
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <Text className="text-xs text-muted-foreground">{category.name}</Text>
                </View>
              )}
            </View>

            {/* Badge de stock */}
            <View
              className={`ml-2 rounded-md px-2 py-1 ${
                stockStatus === 'out'
                  ? 'bg-red-100 dark:bg-red-950'
                  : stockStatus === 'low'
                    ? 'bg-orange-100 dark:bg-orange-950'
                    : 'bg-green-100 dark:bg-green-950'
              }`}>
              <Text
                className={`text-xs font-semibold ${
                  stockStatus === 'out'
                    ? 'text-red-700 dark:text-red-300'
                    : stockStatus === 'low'
                      ? 'text-orange-700 dark:text-orange-300'
                      : 'text-green-700 dark:text-green-300'
                }`}>
                {stockStatus === 'out' ? 'Rupture' : stockStatus === 'low' ? 'Stock bas' : 'OK'}
              </Text>
            </View>
          </View>

          {/* Prix */}
          <Text className="mt-1 text-lg font-bold text-primary">{priceDisplay}</Text>

          {/* Variantes et stock */}
          <View className="mt-1 flex-col items-start justify-between">
            <Text className="text-xs text-muted-foreground">
              {product.variants.length} variante{product.variants.length > 1 ? 's' : ''}
            </Text>
            <Text className="text-xs text-muted-foreground" >
              Stock: {totalStock}
            </Text>
            <Text className="text-xs text-muted-foreground">Valeur: {formatPrice(totalValue)}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row border-t border-border">
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-1 flex-row items-center justify-center border-r border-border py-3">
          <Icon as={EditIcon} size={16} className="mr-2 text-primary" />
          <Text className="font-medium text-primary">Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          className="flex-1 flex-row items-center justify-center py-3">
          <Icon as={TrashIcon} size={16} className="mr-2 text-destructive" />
          <Text className="font-medium text-destructive">Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

