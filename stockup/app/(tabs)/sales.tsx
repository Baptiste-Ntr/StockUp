import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { SearchIcon, CalendarIcon } from 'lucide-react-native';
import { useSales, useProducts } from '@/lib/hooks';
import { SaleItem } from '@/components/SaleItem';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Sale } from '@/lib/types';

export default function SalesScreen() {
  const { sales, deleteSale, reload: reloadSales } = useSales();
  const { products, updateProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Recharger les données quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      reloadSales();
    }, [reloadSales])
  );

  // Gérer la suppression d'une vente
  const handleDeleteSale = useCallback(async (sale: Sale) => {
    Alert.alert(
      'Supprimer la vente',
      `Êtes-vous sûr de vouloir supprimer cette vente de ${sale.quantity} ${sale.productName} - ${sale.variantName} ?\n\nLe stock sera restauré.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Restaurer le stock du produit
              const product = products.find(p => p.id === sale.productId);
              if (product) {
                const updatedVariants = product.variants.map(v =>
                  v.id === sale.variantId
                    ? { ...v, stock: v.stock + sale.quantity }
                    : v
                );
                await updateProduct(product.id, { variants: updatedVariants });
              }

              // Supprimer la vente
              await deleteSale(sale.id);
              
              Alert.alert('Vente supprimée', 'La vente a été supprimée et le stock a été restauré.');
            } catch (error) {
              console.error('Error deleting sale:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la vente.');
            }
          },
        },
      ]
    );
  }, [products, updateProduct, deleteSale]);

  // Filtrer les ventes
  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.productName.toLowerCase().includes(query) ||
        s.variantName.toLowerCase().includes(query)
      );
    }

    // Filtre par période
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    if (selectedPeriod === 'today') {
      const todayStart = now - day;
      filtered = filtered.filter(s => s.timestamp >= todayStart);
    } else if (selectedPeriod === 'week') {
      const weekStart = now - (7 * day);
      filtered = filtered.filter(s => s.timestamp >= weekStart);
    } else if (selectedPeriod === 'month') {
      const monthStart = now - (30 * day);
      filtered = filtered.filter(s => s.timestamp >= monthStart);
    }

    return filtered;
  }, [sales, searchQuery, selectedPeriod]);

  // Calculer les totaux
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalUnits = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

  // Grouper par date
  const groupedSales = useMemo(() => {
    const groups = new Map<string, typeof filteredSales>();
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.timestamp).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(sale);
    });

    return Array.from(groups.entries()).map(([date, sales]) => ({
      date,
      sales,
      total: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    }));
  }, [filteredSales]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-border">
        <Text className="text-3xl font-bold mb-4">Historique des ventes</Text>

        {/* Résumé */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-card rounded-lg p-3 border border-border">
            <Text className="text-sm text-muted-foreground mb-1">Ventes</Text>
            <Text className="text-2xl font-bold">{filteredSales.length}</Text>
          </View>
          <View className="flex-1 bg-card rounded-lg p-3 border border-border">
            <Text className="text-sm text-muted-foreground mb-1">Unités</Text>
            <Text className="text-2xl font-bold">{totalUnits}</Text>
          </View>
          <View className="flex-1 bg-card rounded-lg p-3 border border-border">
            <Text className="text-sm text-muted-foreground mb-1">Revenu</Text>
            <Text className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</Text>
          </View>
        </View>

        {/* Barre de recherche */}
        <View className="flex-row items-center bg-muted rounded-lg px-3 py-2 mb-4">
          <Icon as={SearchIcon} size={20} className="text-muted-foreground mr-2" />
          <Input
            placeholder="Rechercher une vente..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 bg-transparent border-0"
          />
        </View>
      </View>

      {/* Filtres par période */}
      <View className="border-b border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              onPress={() => setSelectedPeriod('all')}
              className={`px-4 py-2 rounded-full ${selectedPeriod === 'all' ? 'bg-primary' : 'bg-muted'}`}>
              <Text className={`text-sm ${selectedPeriod === 'all' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                Toutes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPeriod('today')}
              className={`px-4 py-2 rounded-full ${selectedPeriod === 'today' ? 'bg-primary' : 'bg-muted'}`}>
              <Text className={`text-sm ${selectedPeriod === 'today' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                Aujourd'hui
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-full ${selectedPeriod === 'week' ? 'bg-primary' : 'bg-muted'}`}>
              <Text className={`text-sm ${selectedPeriod === 'week' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                Cette semaine
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-full ${selectedPeriod === 'month' ? 'bg-primary' : 'bg-muted'}`}>
              <Text className={`text-sm ${selectedPeriod === 'month' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                Ce mois
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Liste des ventes */}
      {filteredSales.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Icon as={CalendarIcon} size={64} className="text-muted-foreground mb-4" />
          <Text className="text-lg text-muted-foreground text-center mb-2">
            {sales.length === 0 ? 'Aucune vente enregistrée' : 'Aucune vente trouvée'}
          </Text>
          <Text className="text-sm text-muted-foreground text-center">
            {sales.length === 0
              ? 'Les ventes apparaîtront ici'
              : 'Essayez de modifier vos filtres'}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {groupedSales.map(group => (
            <View key={group.date} className="mb-4">
              <View className="bg-muted px-4 py-2 flex-row justify-between items-center">
                <Text className="font-semibold">{group.date}</Text>
                <Text className="text-sm text-muted-foreground">
                  {formatPrice(group.total)}
                </Text>
              </View>
              <View className="bg-card px-4">
                {group.sales.map((sale, index) => (
                  <View key={sale.id}>
                    <SaleItem sale={sale} onDelete={() => handleDeleteSale(sale)} />
                    {index < group.sales.length - 1 && <Separator />}
                  </View>
                ))}
              </View>
            </View>
          ))}
          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}

