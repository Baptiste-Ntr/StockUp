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
    <View className="rounded-lg border border-border bg-card p-4">
      <Text className="mb-1 text-sm text-muted-foreground">{title}</Text>
      <Text className="mb-2 text-3xl font-bold">{value}</Text>

      {hasChange && (
        <View className="flex-col items-start">
          <View className="flex-row items-center">
            <Icon
              as={isPositive ? TrendingUpIcon : TrendingDownIcon}
              size={16}
              className={isPositive ? 'text-green-600' : 'text-red-600'}
            />
            <Text
              className={`ml-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}
              {change.toFixed(1)}%
            </Text>
          </View>
          {subtitle && <Text className="ml-2 text-xs text-muted-foreground">{subtitle}</Text>}
        </View>
      )}

      {!hasChange && subtitle && <Text className="text-xs text-muted-foreground">{subtitle}</Text>}
    </View>
  );
}

