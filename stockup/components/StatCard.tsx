import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
}

export function StatCard({ title, value, change, subtitle }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined && change !== 0;

  return (
    <View className="bg-card rounded-lg p-4 border border-border">
      <Text className="text-sm text-muted-foreground mb-1">{title}</Text>
      <Text className="text-3xl font-bold mb-2">{value}</Text>
      
      {hasChange && (
        <View className="flex-row items-center">
          <Icon
            as={isPositive ? TrendingUpIcon : TrendingDownIcon}
            size={16}
            className={isPositive ? 'text-green-600' : 'text-red-600'}
          />
          <Text className={`text-sm font-semibold ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </Text>
          {subtitle && (
            <Text className="text-xs text-muted-foreground ml-2">{subtitle}</Text>
          )}
        </View>
      )}
      
      {!hasChange && subtitle && (
        <Text className="text-xs text-muted-foreground">{subtitle}</Text>
      )}
    </View>
  );
}

