import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

export function ProgressBar({ label, value, maxValue, color = '#3B82F6' }: ProgressBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-medium" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-sm font-bold">{value}</Text>
      </View>
      <View className="h-2 bg-muted rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

