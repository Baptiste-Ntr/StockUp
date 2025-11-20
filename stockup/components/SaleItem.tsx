import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PackageIcon } from 'lucide-react-native';
import type { Sale } from '@/lib/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';

interface SaleItemProps {
  sale: Sale;
}

export function SaleItem({ sale }: SaleItemProps) {
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
    </View>
  );
}

