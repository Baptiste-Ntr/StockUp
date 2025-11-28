import { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, PlusIcon, FilterIcon, AlertTriangleIcon } from 'lucide-react-native';
import { useProducts, useCategories, useSettings } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import type { StockStatus, ProductSortBy } from '@/lib/types';
import { getStockStatus, calculateStockInfo } from '@/lib/utils';

export default function InventoryScreen() {
  const router = useRouter();
  const { products, deleteProduct, reload: reloadProducts } = useProducts();
  const { categories, reload: reloadCategories } = useCategories();
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<StockStatus>('all');
  const [sortBy, setSortBy] = useState<ProductSortBy>('name-asc');

  // Recharger les données quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      reloadProducts();
      reloadCategories();
    }, [reloadProducts, reloadCategories])
  );

  // Filtrer et trier les produits
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Recherche par nom
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    // Filtrer par statut de stock
    if (selectedStockStatus !== 'all') {
      filtered = filtered.filter(p => {
        const stockInfo = calculateStockInfo(p.variants);
        const totalStatus = getStockStatus(stockInfo.available, settings.lowStockThreshold);
        
        // Vérifier si au moins une variante correspond au statut recherché (ignorer stocks négatifs)
        const hasVariantWithStatus = p.variants.some(v => {
          if (v.stock < 0) return false;
          const variantStatus = getStockStatus(v.stock, settings.lowStockThreshold);
          return variantStatus === selectedStockStatus;
        });
        
        // Le produit apparaît si le total OU une variante correspond au statut
        return totalStatus === selectedStockStatus || hasVariantWithStatus;
      });
    }

    // Trier
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'stock-low':
        sorted.sort((a, b) => {
          const stockA = calculateStockInfo(a.variants).available;
          const stockB = calculateStockInfo(b.variants).available;
          return stockA - stockB;
        });
        break;
      case 'stock-high':
        sorted.sort((a, b) => {
          const stockA = calculateStockInfo(a.variants).available;
          const stockB = calculateStockInfo(b.variants).available;
          return stockB - stockA;
        });
        break;
    }

    return sorted;
  }, [products, searchQuery, selectedCategory, selectedStockStatus, sortBy, settings.lowStockThreshold]);

  // Compter les produits en stock bas (si une variante ou le total est en stock bas)
  const lowStockCount = useMemo(() => {
    return products.filter(p => {
      const stockInfo = calculateStockInfo(p.variants);
      const totalStatus = getStockStatus(stockInfo.available, settings.lowStockThreshold);
      
      // Vérifier si au moins une variante est en stock bas (ignorer stocks négatifs)
      const hasLowStockVariant = p.variants.some(v => {
        if (v.stock < 0) return false;
        const variantStatus = getStockStatus(v.stock, settings.lowStockThreshold);
        return variantStatus === 'low' || variantStatus === 'out';
      });
      
      return totalStatus === 'low' || totalStatus === 'out' || hasLowStockVariant;
    }).length;
  }, [products, settings.lowStockThreshold]);

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Supprimer le produit "${productName}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(productId);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-border">
        <Text className="text-3xl font-bold mb-4">Inventaire</Text>

        {/* Barre de recherche */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-1 flex-row items-center bg-muted rounded-lg px-3 py-2">
            <Icon as={SearchIcon} size={20} className="text-muted-foreground mr-2" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 bg-transparent border-0"
            />
          </View>
        </View>

        {/* Bouton ajouter */}
        <Button
          onPress={() => router.push('/add-product')}
          className="w-full mb-4">
          <Icon as={PlusIcon} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-semibold ml-2">
            Ajouter un produit
          </Text>
        </Button>

        {/* Alerte stock bas */}
        {lowStockCount > 0 && (
          <TouchableOpacity
            onPress={() => setSelectedStockStatus('low')}
            className="bg-orange-50 dark:bg-orange-950 border border-orange-300 dark:border-orange-700 rounded-lg p-3 flex-row items-center">
            <Icon as={AlertTriangleIcon} size={20} className="text-orange-600 dark:text-orange-400 mr-3" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                {lowStockCount} produit{lowStockCount > 1 ? 's' : ''} en stock bas
              </Text>
              <Text className="text-xs text-orange-700 dark:text-orange-300">
                Certains articles sont presque en rupture de stock
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View className="border-b border-border">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
          <View className="flex-row gap-2 items-center">
            {/* Filtre catégories */}
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full ${selectedCategory === 'all' ? 'bg-primary' : 'bg-muted'}`}>
              <Text className={`text-sm ${selectedCategory === 'all' ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                Toutes
              </Text>
            </TouchableOpacity>

            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full ${selectedCategory === cat.id ? 'bg-primary' : 'bg-muted'}`}>
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <Text className={`text-sm ${selectedCategory === cat.id ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                    {cat.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Séparateur */}
            <View className="w-px h-6 bg-border mx-1" />
            
            {/* Filtre stock */}
            <TouchableOpacity
              onPress={() => setSelectedStockStatus(selectedStockStatus === 'low' ? 'all' : 'low')}
              className={`px-4 py-2 rounded-full ${selectedStockStatus === 'low' ? 'bg-orange-500' : 'bg-muted'}`}>
              <Text className={`text-sm ${selectedStockStatus === 'low' ? 'text-white font-semibold' : 'text-foreground'}`}>
                Stock bas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedStockStatus(selectedStockStatus === 'out' ? 'all' : 'out')}
              className={`px-4 py-2 rounded-full ${selectedStockStatus === 'out' ? 'bg-destructive' : 'bg-muted'}`}>
              <Text className={`text-sm ${selectedStockStatus === 'out' ? 'text-white font-semibold' : 'text-foreground'}`}>
                Rupture
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Liste des produits */}
      <View className="flex-1">
        {filteredProducts.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-lg text-muted-foreground text-center mb-2">
              {products.length === 0 
                ? 'Aucun produit dans l\'inventaire'
                : 'Aucun produit trouvé'}
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              {products.length === 0
                ? 'Commencez par ajouter votre premier produit'
                : 'Essayez de modifier vos filtres'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                category={categories.find(c => c.id === item.categoryId)}
                lowStockThreshold={settings.lowStockThreshold}
                onDelete={() => handleDeleteProduct(item.id, item.name)}
              />
            )}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
          />
        )}
      </View>
    </View>
  );
}

