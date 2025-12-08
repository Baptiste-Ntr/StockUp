// Types pour l'application StockUp

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  photoUri?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface ProductVariant {
  id: string;
  name: string; // ex: "Small, Red" ou "Adulte M"
  price: number;
  stock: number;
  allowNegativeStock?: boolean; // Option pour autoriser le stock négatif (prévente)
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[]; // URIs des images
  categoryId?: string;
  variants: ProductVariant[];
  createdAt: number;
  updatedAt: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string; // Pour affichage sans lookup
  variantId: string;
  variantName: string;
  quantity: number;
  price: number; // Prix unitaire de vente
  totalAmount: number; // quantity * price
  timestamp: number;
}

export interface AppSettings {
  lowStockThreshold: number;
  allowNegativeStockGlobal?: boolean; // Option globale pour autoriser le stock négatif
  theme?: 'light' | 'dark'; // Préférence de thème
}

// Types pour les filtres et tris
export type StockStatus = 'all' | 'ok' | 'low' | 'out';
export type ProductSortBy = 'name-asc' | 'name-desc' | 'stock-low' | 'stock-high';
export type TimePeriod = 'week' | 'month';

// Statistiques calculées
export interface SalesStats {
  totalUnits: number;
  totalRevenue: number;
  unitsChange: number; // pourcentage
  revenueChange: number; // pourcentage
  topProducts: Array<{
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    totalUnits: number;
  }>;
  revenueByCategory: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
  }>;
}

