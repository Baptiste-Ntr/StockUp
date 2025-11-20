import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PlusCircleIcon } from 'lucide-react-native';
import { useUser, useSales, useProducts, useCategories } from '@/lib/hooks';
import { StatCard } from '@/components/StatCard';
import { SaleItem } from '@/components/SaleItem';
import { ProgressBar } from '@/components/ProgressBar';
import { calculateSalesStats } from '@/lib/stats';
import { formatPrice } from '@/lib/utils';
import type { TimePeriod } from '@/lib/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { sales, reload: reloadSales } = useSales();
  const { products, reload: reloadProducts } = useProducts();
  const { categories, reload: reloadCategories } = useCategories();

  const [period, setPeriod] = useState<TimePeriod>('week');

  // Recharger les données quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      reloadSales();
      reloadProducts();
      reloadCategories();
    }, [reloadSales, reloadProducts, reloadCategories])
  );

  // Calculer les statistiques
  const stats = calculateSalesStats(sales, products, categories, period);

  // Dernières ventes (5 max)
  const recentSales = sales.slice(0, 5);

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold">StockUp</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
            {user?.photoUri ? (
              <Avatar alt={`${user.firstName} ${user.lastName}`} className="w-12 h-12">
                <Image source={{ uri: user.photoUri }} className="w-full h-full" />
              </Avatar>
            ) : (
              <Avatar alt={`${user?.firstName} ${user?.lastName}`} className="w-12 h-12 bg-primary">
                <Text className="text-primary-foreground text-lg font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              </Avatar>
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-bold mb-2">
          Bienvenue, {user?.firstName} !
        </Text>
      </View>

      <View className="px-4">
        {/* Bouton principal - Ajouter une vente */}
        <Button
          onPress={() => router.push('/add-sale')}
          className="w-full mb-6"
          size="lg">
          <Icon as={PlusCircleIcon} size={24} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-bold text-lg ml-2">
            Ajouter une vente
          </Text>
        </Button>

        {/* Dernières ventes */}
        {recentSales.length > 0 && (
          <View className="bg-card rounded-lg p-4 mb-6 border border-border">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold">Dernières ventes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/sales')}>
                <Text className="text-sm text-primary">Voir tout</Text>
              </TouchableOpacity>
            </View>
            
            <Separator className="mb-2" />
            
            {recentSales.map((sale, index) => (
              <View key={sale.id}>
                <SaleItem sale={sale} />
                {index < recentSales.length - 1 && <Separator />}
              </View>
            ))}
          </View>
        )}

        {/* Toggle période */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={() => setPeriod('week')}
            className={`flex-1 py-3 rounded-lg ${period === 'week' ? 'bg-primary' : 'bg-muted'}`}>
            <Text className={`text-center font-semibold ${period === 'week' ? 'text-primary-foreground' : 'text-foreground'}`}>
              Cette semaine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPeriod('month')}
            className={`flex-1 py-3 rounded-lg ${period === 'month' ? 'bg-primary' : 'bg-muted'}`}>
            <Text className={`text-center font-semibold ${period === 'month' ? 'text-primary-foreground' : 'text-foreground'}`}>
              Ce mois
            </Text>
          </TouchableOpacity>
        </View>

        {/* KPIs */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <StatCard
              title="Unités vendues"
              value={stats.totalUnits.toString()}
              change={stats.unitsChange}
              subtitle={period === 'week' ? 'Cette semaine' : 'Ce mois'}
            />
          </View>
          <View className="flex-1">
            <StatCard
              title="Revenu"
              value={formatPrice(stats.totalRevenue)}
              change={stats.revenueChange}
              subtitle={period === 'week' ? 'Cette semaine' : 'Ce mois'}
            />
          </View>
        </View>

        {/* Produits les plus vendus */}
        {stats.topProducts.length > 0 && (
          <View className="bg-card rounded-lg p-4 mb-6 border border-border">
            <Text className="text-lg font-bold mb-4">Produits les plus vendus</Text>
            {stats.topProducts.map((product, index) => (
              <ProgressBar
                key={`${product.productId}-${product.variantId}`}
                label={`${product.productName} - ${product.variantName}`}
                value={product.totalUnits}
                maxValue={stats.topProducts[0].totalUnits}
                color={index === 0 ? '#3B82F6' : '#94A3B8'}
              />
            ))}
          </View>
        )}

        {/* Revenus par catégorie */}
        {stats.revenueByCategory.length > 0 && (
          <View className="bg-card rounded-lg p-4 mb-6 border border-border">
            <Text className="text-lg font-bold mb-4">Revenus par catégorie</Text>
            <View className="gap-3">
              {stats.revenueByCategory.map(cat => {
                const category = categories.find(c => c.id === cat.categoryId);
                const maxRevenue = stats.revenueByCategory[0].revenue;
                const percentage = (cat.revenue / maxRevenue) * 100;
                
                return (
                  <View key={cat.categoryId} className="gap-2">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center flex-1">
                        {category && (
                          <View
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        <Text className="font-medium" numberOfLines={1}>
                          {cat.categoryName}
                        </Text>
                      </View>
                      <Text className="font-bold text-primary ml-2">
                        {formatPrice(cat.revenue)}
                      </Text>
                    </View>
                    <View className="h-2 bg-muted rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: category?.color || '#3B82F6',
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Message si pas de ventes */}
        {sales.length === 0 && (
          <View className="bg-card rounded-lg p-8 items-center border border-border">
            <Text className="text-lg font-semibold mb-2 text-center">
              Aucune vente enregistrée
            </Text>
            <Text className="text-sm text-muted-foreground text-center mb-4">
              Commencez par ajouter votre première vente
            </Text>
            <Button onPress={() => router.push('/add-sale')}>
              <Text className="text-primary-foreground">Ajouter une vente</Text>
            </Button>
          </View>
        )}

        {/* Espace en bas */}
        <View className="h-8" />
      </View>
    </ScrollView>
  );
}

