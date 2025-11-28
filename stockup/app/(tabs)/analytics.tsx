import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  PackageIcon, 
  DollarSignIcon,
  AlertCircleIcon,
  BarChart3Icon,
  PieChartIcon,
  CalendarIcon
} from 'lucide-react-native';
import { useProducts, useSales, useCategories } from '@/lib/hooks';
import { formatPrice } from '@/lib/utils';
import type { Product, Sale } from '@/lib/types';

export default function AnalyticsScreen() {
  const { products, reload: reloadProducts } = useProducts();
  const { sales, reload: reloadSales } = useSales();
  const { categories, reload: reloadCategories } = useCategories();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  // Recharger les données quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      reloadProducts();
      reloadSales();
      reloadCategories();
    }, [reloadProducts, reloadSales, reloadCategories])
  );

  // Calculer l'argent dormant dans l'inventaire
  const inventoryValue = useMemo(() => {
    return products.reduce((total, product) => {
      const productValue = product.variants.reduce((sum, variant) => {
        return sum + (variant.price * variant.stock);
      }, 0);
      return total + productValue;
    }, 0);
  }, [products]);

  // Calculer le nombre total d'articles en stock (uniquement stock disponible)
  const totalStockUnits = useMemo(() => {
    return products.reduce((total, product) => {
      const productStock = product.variants.reduce((sum, variant) => {
        return sum + (variant.stock > 0 ? variant.stock : 0);
      }, 0);
      return total + productStock;
    }, 0);
  }, [products]);

  // Calculer le nombre de produits différents
  const totalProducts = products.length;
  const totalVariants = useMemo(() => {
    return products.reduce((total, product) => total + product.variants.length, 0);
  }, [products]);

  // Filtrer les ventes par période
  const filteredSales = useMemo(() => {
    if (selectedPeriod === 'all') return sales;
    
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const periodStart = selectedPeriod === 'week' ? now - (7 * day) : now - (30 * day);
    
    return sales.filter(s => s.timestamp >= periodStart);
  }, [sales, selectedPeriod]);

  // Calculer le chiffre d'affaires
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  }, [filteredSales]);

  // Calculer les unités vendues
  const totalUnitsSold = useMemo(() => {
    return filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  }, [filteredSales]);

  // Calculer le prix moyen de vente
  const averageSalePrice = useMemo(() => {
    if (filteredSales.length === 0) return 0;
    return totalRevenue / filteredSales.length;
  }, [totalRevenue, filteredSales]);

  // Produits les plus vendus
  const topSellingProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; variantName: string; quantity: number; revenue: number }>();
    
    filteredSales.forEach(sale => {
      const key = `${sale.productId}-${sale.variantId}`;
      const existing = productSales.get(key);
      
      if (existing) {
        existing.quantity += sale.quantity;
        existing.revenue += sale.totalAmount;
      } else {
        productSales.set(key, {
          name: sale.productName,
          variantName: sale.variantName,
          quantity: sale.quantity,
          revenue: sale.totalAmount,
        });
      }
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  // Produits avec le plus de valeur dormante
  const topDormantProducts = useMemo(() => {
    return products
      .map(product => {
        const variants = product.variants.map(variant => ({
          variantName: variant.name,
          stock: variant.stock,
          value: variant.price * variant.stock,
        }));
        
        const totalValue = variants.reduce((sum, v) => sum + v.value, 0);
        
        return {
          name: product.name,
          variants,
          totalValue,
        };
      })
      .filter(p => p.totalValue > 0)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }, [products]);

  // Calculer le taux de rotation des stocks
  const stockTurnoverRate = useMemo(() => {
    if (inventoryValue === 0) return 0;
    return (totalRevenue / inventoryValue) * 100;
  }, [totalRevenue, inventoryValue]);

  // Produits en rupture de stock (stock disponible = 0)
  const outOfStockProducts = useMemo(() => {
    return products.filter(product => {
      const availableStock = product.variants.reduce((sum, v) => sum + (v.stock > 0 ? v.stock : 0), 0);
      return availableStock === 0;
    }).length;
  }, [products]);

  // Produits avec stock négatif
  const negativeStockProducts = useMemo(() => {
    return products.filter(product => {
      return product.variants.some(v => v.stock < 0);
    }).length;
  }, [products]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-12 pb-6">
          <Text className="text-3xl font-bold mb-2">Analytics</Text>
          <Text className="text-muted-foreground">Analyse détaillée de votre activité</Text>
        </View>

        {/* Filtres par période */}
        <View className="px-4 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setSelectedPeriod('week')}
                className={`px-4 py-2 rounded-full ${selectedPeriod === 'week' ? 'bg-primary' : 'bg-muted'}`}>
                <Text className={`text-sm ${selectedPeriod === 'week' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                  7 jours
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-full ${selectedPeriod === 'month' ? 'bg-primary' : 'bg-muted'}`}>
                <Text className={`text-sm ${selectedPeriod === 'month' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                  30 jours
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedPeriod('all')}
                className={`px-4 py-2 rounded-full ${selectedPeriod === 'all' ? 'bg-primary' : 'bg-muted'}`}>
                <Text className={`text-sm ${selectedPeriod === 'all' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                  Tout
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Section Inventaire */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center mb-4">
            <Icon as={PackageIcon} size={20} className="text-primary mr-2" />
            <Text className="text-xl font-bold">Inventaire</Text>
          </View>

          {/* Argent dormant - Carte principale */}
          <View className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 mb-4 border border-primary">
            <View className="flex-row items-center mb-2">
              <Icon as={DollarSignIcon} size={24} className="text-primary-foreground mr-2" />
              <Text className="text-primary-foreground text-sm font-medium">Argent dormant</Text>
            </View>
            <Text className="text-4xl font-bold text-primary-foreground mb-1">
              {formatPrice(inventoryValue)}
            </Text>
            <Text className="text-primary-foreground/80 text-xs">
              Valeur totale des stocks invendus
            </Text>
          </View>

          {/* Stats inventaire */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-card rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted-foreground mb-1">Articles</Text>
              <Text className="text-2xl font-bold">{totalStockUnits}</Text>
              <Text className="text-xs text-muted-foreground mt-1">en stock</Text>
            </View>
            <View className="flex-1 bg-card rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted-foreground mb-1">Produits</Text>
              <Text className="text-2xl font-bold">{totalProducts}</Text>
              <Text className="text-xs text-muted-foreground mt-1">{totalVariants} variantes</Text>
            </View>
          </View>

          {/* Alertes */}
          {(outOfStockProducts > 0 || negativeStockProducts > 0) && (
            <View className="bg-destructive/10 rounded-lg p-4 border border-destructive/20 mb-4">
              <View className="flex-row items-center mb-2">
                <Icon as={AlertCircleIcon} size={18} className="text-destructive mr-2" />
                <Text className="font-semibold text-destructive">Alertes Stock</Text>
              </View>
              {outOfStockProducts > 0 && (
                <Text className="text-sm text-muted-foreground mb-1">
                  • {outOfStockProducts} produit(s) en rupture de stock
                </Text>
              )}
              {negativeStockProducts > 0 && (
                <Text className="text-sm text-muted-foreground">
                  • {negativeStockProducts} produit(s) en stock négatif (prévente)
                </Text>
              )}
            </View>
          )}

          {/* Top produits dormants */}
          {topDormantProducts.length > 0 && (
            <View className="bg-card rounded-lg p-4 border border-border">
              <Text className="font-semibold mb-3">Top 5 - Valeur dormante</Text>
              {topDormantProducts.map((product, index) => (
                <View key={index}>
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1">
                      <Text className="font-medium" numberOfLines={1}>{product.name}</Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {product.variants.map(v => `${v.variantName} (${v.stock})`).join(', ')}
                      </Text>
                    </View>
                    <Text className="font-bold text-primary ml-3">
                      {formatPrice(product.totalValue)}
                    </Text>
                  </View>
                  {index < topDormantProducts.length - 1 && <Separator />}
                </View>
              ))}
            </View>
          )}
        </View>

        <Separator className="my-2" />

        {/* Section Ventes */}
        <View className="px-4 mb-6 mt-6">
          <View className="flex-row items-center mb-4">
            <Icon as={BarChart3Icon} size={20} className="text-primary mr-2" />
            <Text className="text-xl font-bold">Performance des Ventes</Text>
          </View>

          {/* Stats ventes */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-card rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted-foreground mb-1">Chiffre d'affaires</Text>
              <Text className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</Text>
            </View>
            <View className="flex-1 bg-card rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted-foreground mb-1">Unités</Text>
              <Text className="text-2xl font-bold">{totalUnitsSold}</Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-card rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted-foreground mb-1">Ventes</Text>
              <Text className="text-2xl font-bold">{filteredSales.length}</Text>
            </View>
            <View className="flex-1 bg-card rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted-foreground mb-1">Panier moyen</Text>
              <Text className="text-2xl font-bold">{formatPrice(averageSalePrice)}</Text>
            </View>
          </View>

          {/* Taux de rotation */}
          <View className="bg-card rounded-lg p-4 border border-border mb-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">Taux de rotation</Text>
                <Text className="text-xs text-muted-foreground">
                  Ventes / Valeur stock
                </Text>
              </View>
              <View className="flex-row items-center">
                <Icon 
                  as={stockTurnoverRate > 50 ? TrendingUpIcon : TrendingDownIcon} 
                  size={20} 
                  className={stockTurnoverRate > 50 ? 'text-green-500 mr-2' : 'text-orange-500 mr-2'} 
                />
                <Text className="text-2xl font-bold">
                  {stockTurnoverRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Top produits vendus */}
          {topSellingProducts.length > 0 && (
            <View className="bg-card rounded-lg p-4 border border-border">
              <Text className="font-semibold mb-3">Top 5 - Meilleures ventes</Text>
              {topSellingProducts.map((product, index) => (
                <View key={index}>
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1">
                      <Text className="font-medium" numberOfLines={1}>
                        {product.name} - {product.variantName}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {product.quantity} unités vendues
                      </Text>
                    </View>
                    <Text className="font-bold text-primary ml-3">
                      {formatPrice(product.revenue)}
                    </Text>
                  </View>
                  {index < topSellingProducts.length - 1 && <Separator />}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Espace en bas */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

