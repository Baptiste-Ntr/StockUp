import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PackageIcon, TrashIcon } from 'lucide-react-native';
import type { Sale } from '@/lib/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface SaleItemProps {
  sale: Sale;
  onDelete?: () => void;
}

export function SaleItem({ sale, onDelete }: SaleItemProps) {
  return (
    <View className="flex-row items-center py-3">
      {/* Icône */}
      <View className="w-12 h-12 rounded-full bg-muted items-center justify-center mr-3">
        <Icon as={PackageIcon} size={20} className="text-muted-foreground" />
      </View>

      {/* Contenu */}
      <View className="flex-1">
        <Text className="font-semibold" numberOfLines={1}>
          {sale.productName}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {sale.variantName} • Qty: {sale.quantity}
        </Text>
      </View>

      {/* Prix et date */}
      <View className="items-end ml-3">
        <Text className="font-bold text-primary">
          {formatPrice(sale.totalAmount)}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {formatRelativeTime(sale.timestamp)}
        </Text>
      </View>

      {/* Bouton de suppression */}
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          className="ml-3 p-2 rounded-lg bg-destructive/10"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon as={TrashIcon} size={18} className="text-destructive" />
        </TouchableOpacity>
      )}
    </View>
  );
}

