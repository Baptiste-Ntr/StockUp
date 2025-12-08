import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  Category,
  Product,
  Sale,
  AppSettings,
} from './types';

// Clés de stockage
const KEYS = {
  USER: '@stockup:user',
  CATEGORIES: '@stockup:categories',
  PRODUCTS: '@stockup:products',
  SALES: '@stockup:sales',
  SETTINGS: '@stockup:settings',
};

// ========== USER ==========

export async function getUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function updateUser(updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    await saveUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// ========== CATEGORIES ==========

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
}

export async function addCategory(category: Category): Promise<void> {
  const categories = await getCategories();
  categories.push(category);
  await saveCategories(categories);
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    await saveCategories(categories);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== id);
  await saveCategories(filtered);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.id === id) || null;
}

// ========== PRODUCTS ==========

export async function getProducts(): Promise<Product[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
}

export async function addProduct(product: Product): Promise<void> {
  const products = await getProducts();
  products.push(product);
  await saveProducts(products);
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { 
      ...products[index], 
      ...updates,
      updatedAt: Date.now(),
    };
    await saveProducts(products);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  await saveProducts(filtered);
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

// ========== SALES ==========

export async function getSales(): Promise<Sale[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SALES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting sales:', error);
    return [];
  }
}

export async function saveSales(sales: Sale[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SALES, JSON.stringify(sales));
  } catch (error) {
    console.error('Error saving sales:', error);
    throw error;
  }
}

export async function addSale(sale: Sale): Promise<void> {
  const sales = await getSales();
  sales.push(sale);
  await saveSales(sales);
}

export async function deleteSale(id: string): Promise<void> {
  const sales = await getSales();
  const filtered = sales.filter(s => s.id !== id);
  await saveSales(filtered);
}

// ========== SETTINGS ==========

const DEFAULT_SETTINGS: AppSettings = {
  lowStockThreshold: 10,
  allowNegativeStockGlobal: false,
  theme: 'light',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    const parsed = data ? JSON.parse(data) : {};
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const settings = await getSettings();
  const updated = { ...settings, ...updates };
  await saveSettings(updated);
}

// ========== UTILITY FUNCTIONS ==========

export async function resetAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USER,
      KEYS.CATEGORIES,
      KEYS.PRODUCTS,
      KEYS.SALES,
      KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
}

export async function exportData(): Promise<string> {
  try {
    const user = await getUser();
    const categories = await getCategories();
    const products = await getProducts();
    const sales = await getSales();
    const settings = await getSettings();

    const data = {
      user,
      categories,
      products,
      sales,
      settings,
      exportedAt: Date.now(),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

