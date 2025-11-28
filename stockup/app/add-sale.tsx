import { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { SearchIcon, PlusIcon, MinusIcon, CheckIcon, PackageIcon } from 'lucide-react-native';
import { useProducts, useSales, useSettings } from '@/lib/hooks';
import { generateId, formatPrice, calculateStockInfo } from '@/lib/utils';
import type { Sale, Product, ProductVariant } from '@/lib/types';

export default function AddSaleScreen() {
  const router = useRouter();
  const { products, updateProduct } = useProducts();
  const { addSale } = useSales();
  const { settings } = useSettings();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrer les produits par recherche
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(query));
  }, [products, searchQuery]);

  // Calculer le total
  const total = useMemo(() => {
    const price = parseFloat(salePrice) || 0;
    return price * quantity;
  }, [salePrice, quantity]);

  // Sélectionner un produit
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setSalePrice('');
    setQuantity(1);
    setIsProductPickerOpen(false);
    
    // Si le produit n'a qu'une variante, la sélectionner automatiquement
    if (product.variants.length === 1) {
      const variant = product.variants[0];
      setSelectedVariant(variant);
      setSalePrice(variant.price.toString());
    } else {
      setIsVariantPickerOpen(true);
    }
  };

  // Sélectionner une variante
  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSalePrice(variant.price.toString());
    setIsVariantPickerOpen(false);
  };

  // Vérifier si le stock négatif est autorisé
  const isNegativeStockAllowed = (variant: ProductVariant) => {
    // Priorité : option spécifique à la variante, sinon option globale
    if (variant.allowNegativeStock !== undefined) {
      return variant.allowNegativeStock;
    }
    return settings.allowNegativeStockGlobal || false;
  };

  // Modifier la quantité
  const handleQuantityChange = (increment: boolean) => {
    if (!selectedVariant) return;
    
    if (increment) {
      const allowNegative = isNegativeStockAllowed(selectedVariant);
      if (!allowNegative && quantity >= selectedVariant.stock) {
        Alert.alert('Stock insuffisant', `Seulement ${selectedVariant.stock} disponible(s) en stock.`);
      } else {
        setQuantity(quantity + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  // Valider et enregistrer la vente
  const handleConfirmSale = async () => {
    if (!selectedProduct || !selectedVariant) {
      Alert.alert('Sélection incomplète', 'Veuillez sélectionner un produit et une variante.');
      return;
    }

    const price = parseFloat(salePrice);
    if (!price || price <= 0) {
      Alert.alert('Prix invalide', 'Veuillez entrer un prix de vente valide.');
      return;
    }

    // Vérifier le stock seulement si le stock négatif n'est pas autorisé
    const allowNegative = isNegativeStockAllowed(selectedVariant);
    if (!allowNegative && quantity > selectedVariant.stock) {
      Alert.alert('Stock insuffisant', `Seulement ${selectedVariant.stock} disponible(s) en stock.`);
      return;
    }

    // Avertir si le stock devient négatif
    if (allowNegative && quantity > selectedVariant.stock) {
      const newStock = selectedVariant.stock - quantity;
      Alert.alert(
        'Prévente',
        `Cette vente va créer un stock négatif de ${newStock} unités. Voulez-vous continuer ?`,
        [
          { text: 'Annuler', style: 'cancel', onPress: () => setIsSubmitting(false) },
          { text: 'Confirmer', onPress: () => executeSale() },
        ]
      );
      return;
    }

    setIsSubmitting(true);
    await executeSale();
  };

  const executeSale = async () => {
    if (!selectedProduct || !selectedVariant) return;
    
    setIsSubmitting(true);
    const price = parseFloat(salePrice);

    try {
      // Créer la vente
      const sale: Sale = {
        id: generateId(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        quantity,
        price,
        totalAmount: total,
        timestamp: Date.now(),
      };

      await addSale(sale);

      // Mettre à jour le stock du produit
      const updatedVariants = selectedProduct.variants.map(v =>
        v.id === selectedVariant.id
          ? { ...v, stock: v.stock - quantity }
          : v
      );

      await updateProduct(selectedProduct.id, { variants: updatedVariants });

      // Retour et notification
      Alert.alert('Vente enregistrée', 'La vente a été enregistrée avec succès.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error recording sale:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la vente.');
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Sélection du produit */}
        <View className="gap-2 mb-6">
          <Text className="text-base font-semibold">Produit *</Text>
          <TouchableOpacity
            onPress={() => setIsProductPickerOpen(true)}
            className="flex-row items-center justify-between bg-background border border-input rounded-lg px-4 py-4">
            <Text className={selectedProduct ? 'text-foreground' : 'text-muted-foreground'}>
              {selectedProduct ? selectedProduct.name : 'Sélectionner un produit'}
            </Text>
            <Icon as={SearchIcon} size={20} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>

        {/* Sélection de la variante */}
        {selectedProduct && selectedProduct.variants.length > 1 && (
          <View className="gap-2 mb-6">
            <Text className="text-base font-semibold">Variante *</Text>
            <TouchableOpacity
              onPress={() => setIsVariantPickerOpen(true)}
              className="flex-row items-center justify-between bg-background border border-input rounded-lg px-4 py-4">
              <Text className={selectedVariant ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedVariant ? selectedVariant.name : 'Sélectionner une variante'}
              </Text>
              <Text className="text-muted-foreground">
                {selectedVariant ? `Stock: ${selectedVariant.stock}` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedVariant && (
          <>
            <Separator className="mb-6" />

            {/* Stock disponible */}
            <View className="bg-muted rounded-lg p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium">Stock disponible</Text>
                <Text className="text-lg font-bold">{selectedVariant.stock}</Text>
              </View>
              {isNegativeStockAllowed(selectedVariant) && (
                <Text className="text-xs text-primary mt-2">
                  ✓ Stock négatif autorisé (prévente possible)
                </Text>
              )}
            </View>

            {/* Quantité */}
            <View className="gap-2 mb-6">
              <Text className="text-base font-semibold">Quantité *</Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => handleQuantityChange(false)}
                  disabled={quantity <= 1}
                  className={`bg-muted p-4 rounded-lg ${quantity <= 1 ? 'opacity-50' : ''}`}>
                  <Icon as={MinusIcon} size={24} />
                </TouchableOpacity>
                
                <View className="flex-1 bg-background border border-input rounded-lg py-4 items-center">
                  <Text className="text-2xl font-bold">{quantity}</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleQuantityChange(true)}
                  className="bg-muted p-4 rounded-lg">
                  <Icon as={PlusIcon} size={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Prix de vente */}
            <View className="gap-2 mb-6">
              <Text className="text-base font-semibold">Prix unitaire (€) *</Text>
              <Input
                placeholder="0.00"
                value={salePrice}
                onChangeText={setSalePrice}
                keyboardType="decimal-pad"
                className="text-lg"
              />
              <Text className="text-xs text-muted-foreground">
                Prix suggéré: {formatPrice(selectedVariant.price)}
              </Text>
            </View>

            <Separator className="mb-6" />

            {/* Total */}
            <View className="bg-primary/10 rounded-lg p-6 mb-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold">Total</Text>
                <Text className="text-3xl font-bold text-primary">
                  {formatPrice(total)}
                </Text>
              </View>
            </View>

            {/* Boutons d'action */}
            <View className="gap-3 pb-6">
              <Button
                onPress={handleConfirmSale}
                disabled={isSubmitting || !selectedVariant || !salePrice}>
                <Icon as={CheckIcon} className="text-primary-foreground" />
                <Text className="text-primary-foreground font-semibold ml-2">
                  {isSubmitting ? 'Enregistrement...' : 'Confirmer la vente'}
                </Text>
              </Button>
              
              <Button
                variant="outline"
                onPress={() => router.back()}
                disabled={isSubmitting}>
                <Text>Annuler</Text>
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal de sélection de produit */}
      <Modal
        visible={isProductPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsProductPickerOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl max-h-[80%]">
            <View className="p-4 border-b border-border">
              <Text className="text-lg font-semibold text-center mb-3">Sélectionner un produit</Text>
              <View className="flex-row items-center bg-muted rounded-lg px-3 py-2">
                <Icon as={SearchIcon} size={20} className="text-muted-foreground mr-2" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 bg-transparent border-0"
                  autoFocus
                />
              </View>
            </View>
            
            <ScrollView className="px-4 py-2">
              {filteredProducts.length === 0 ? (
                <View className="py-12 items-center">
                  <Text className="text-muted-foreground">Aucun produit trouvé</Text>
                </View>
              ) : (
                filteredProducts.map(product => {
                  const stockInfo = calculateStockInfo(product.variants);
                  const isOutOfStock = stockInfo.available === 0 && !stockInfo.hasNegative;
                  return (
                    <TouchableOpacity
                      key={product.id}
                      onPress={() => handleSelectProduct(product)}
                      disabled={isOutOfStock}
                      className={`py-4 border-b border-border ${isOutOfStock ? 'opacity-50' : ''}`}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-semibold">{product.name}</Text>
                          <Text className="text-sm text-muted-foreground mt-1">
                            {product.variants.length} variante{product.variants.length > 1 ? 's' : ''} • Stock: {stockInfo.displayText}
                          </Text>
                        </View>
                        {isOutOfStock && (
                          <Text className="text-sm text-destructive font-medium ml-2">Rupture</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View className="p-4 border-t border-border">
              <Button
                variant="outline"
                onPress={() => {
                  setIsProductPickerOpen(false);
                  setSearchQuery('');
                }}>
                <Text>Fermer</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de sélection de variante */}
      <Modal
        visible={isVariantPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVariantPickerOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl max-h-[70%]">
            <View className="p-4 border-b border-border">
              <Text className="text-lg font-semibold text-center">Sélectionner une variante</Text>
            </View>
            
            <ScrollView className="px-4 py-2">
              {selectedProduct?.variants.map(variant => (
                <TouchableOpacity
                  key={variant.id}
                  onPress={() => handleSelectVariant(variant)}
                  disabled={variant.stock === 0}
                  className={`py-4 border-b border-border ${variant.stock === 0 ? 'opacity-50' : ''}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold">{variant.name}</Text>
                      <Text className="text-sm text-muted-foreground mt-1">
                        {formatPrice(variant.price)} • Stock: {variant.stock}
                      </Text>
                    </View>
                    {variant.stock === 0 && (
                      <Text className="text-sm text-destructive font-medium ml-2">Rupture</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="p-4 border-t border-border">
              <Button
                variant="outline"
                onPress={() => setIsVariantPickerOpen(false)}>
                <Text>Fermer</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

