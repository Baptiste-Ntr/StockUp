import { useState, useEffect, useCallback } from 'react';
import type { User, Category, Product, Sale, AppSettings } from './types';
import * as storage from './storage';

// Hook pour l'utilisateur
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setLoading(true);
    const userData = await storage.getUser();
    setUser(userData);
    setLoading(false);
  }, []);

  const saveUser = useCallback(async (userData: User) => {
    await storage.saveUser(userData);
    setUser(userData);
  }, []);

  const updateUser = useCallback(async (updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
    const updated = await storage.updateUser(updates);
    if (updated) {
      setUser(updated);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return { user, loading, saveUser, updateUser, reload: loadUser };
}

// Hook pour les catégories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const data = await storage.getCategories();
    setCategories(data);
    setLoading(false);
  }, []);

  const addCategory = useCallback(async (category: Category) => {
    await storage.addCategory(category);
    await loadCategories();
  }, [loadCategories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    await storage.updateCategory(id, updates);
    await loadCategories();
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    await storage.deleteCategory(id);
    await loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, addCategory, updateCategory, deleteCategory, reload: loadCategories };
}

// Hook pour les produits
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const data = await storage.getProducts();
    setProducts(data);
    setLoading(false);
  }, []);

  const addProduct = useCallback(async (product: Product) => {
    await storage.addProduct(product);
    await loadProducts();
  }, [loadProducts]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    await storage.updateProduct(id, updates);
    await loadProducts();
  }, [loadProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    await storage.deleteProduct(id);
    await loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, addProduct, updateProduct, deleteProduct, reload: loadProducts };
}

// Hook pour les ventes
export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setLoading(true);
    const data = await storage.getSales();
    // Trier par timestamp décroissant (plus récent en premier)
    const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
    setSales(sorted);
    setLoading(false);
  }, []);

  const addSale = useCallback(async (sale: Sale) => {
    await storage.addSale(sale);
    await loadSales();
  }, [loadSales]);

  const deleteSale = useCallback(async (id: string) => {
    await storage.deleteSale(id);
    await loadSales();
  }, [loadSales]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return { sales, loading, addSale, deleteSale, reload: loadSales };
}

// Hook pour les settings
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    lowStockThreshold: 10,
    allowNegativeStockGlobal: false,
    theme: 'light',
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const data = await storage.getSettings();
    setSettings(data);
    setLoading(false);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    await storage.updateSettings(updates);
    await loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, loading, updateSettings, reload: loadSettings };
}

