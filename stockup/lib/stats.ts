import type { Sale, Product, Category, SalesStats, TimePeriod } from './types';
import { getPeriodTimestamps, calculatePercentageChange } from './utils';

// Calculer les statistiques de ventes pour une période donnée
export function calculateSalesStats(
  sales: Sale[],
  products: Product[],
  categories: Category[],
  period: TimePeriod
): SalesStats {
  const { start, end, previousStart, previousEnd } = getPeriodTimestamps(period);

  // Ventes de la période actuelle
  const currentSales = sales.filter(s => s.timestamp >= start && s.timestamp <= end);
  
  // Ventes de la période précédente
  const previousSales = sales.filter(s => s.timestamp >= previousStart && s.timestamp <= previousEnd);

  // Calculer unités et revenus
  const totalUnits = currentSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalRevenue = currentSales.reduce((sum, s) => sum + s.totalAmount, 0);
  
  const previousUnits = previousSales.reduce((sum, s) => sum + s.quantity, 0);
  const previousRevenue = previousSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Calculer les changements en pourcentage
  const unitsChange = calculatePercentageChange(totalUnits, previousUnits);
  const revenueChange = calculatePercentageChange(totalRevenue, previousRevenue);

  // Calculer les produits les plus vendus
  const productSales = new Map<string, { quantity: number; productName: string; variantName: string }>();
  
  currentSales.forEach(sale => {
    const key = `${sale.productId}-${sale.variantId}`;
    const existing = productSales.get(key);
    
    if (existing) {
      existing.quantity += sale.quantity;
    } else {
      productSales.set(key, {
        quantity: sale.quantity,
        productName: sale.productName,
        variantName: sale.variantName,
      });
    }
  });

  const topProducts = Array.from(productSales.entries())
    .map(([key, data]) => {
      const [productId, variantId] = key.split('-');
      return {
        productId,
        variantId,
        productName: data.productName,
        variantName: data.variantName,
        totalUnits: data.quantity,
      };
    })
    .sort((a, b) => b.totalUnits - a.totalUnits)
    .slice(0, 5);

  // Calculer revenus par catégorie
  const categoryRevenue = new Map<string, { revenue: number; categoryName: string }>();
  
  currentSales.forEach(sale => {
    const product = products.find(p => p.id === sale.productId);
    if (!product || !product.categoryId) return;
    
    const category = categories.find(c => c.id === product.categoryId);
    if (!category) return;
    
    const existing = categoryRevenue.get(product.categoryId);
    
    if (existing) {
      existing.revenue += sale.totalAmount;
    } else {
      categoryRevenue.set(product.categoryId, {
        revenue: sale.totalAmount,
        categoryName: category.name,
      });
    }
  });

  const revenueByCategory = Array.from(categoryRevenue.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.categoryName,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalUnits,
    totalRevenue,
    unitsChange,
    revenueChange,
    topProducts,
    revenueByCategory,
  };
}

