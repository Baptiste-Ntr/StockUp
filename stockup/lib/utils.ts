import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Générer un ID unique
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Formater les prix
export function formatPrice(price: number): string {
  return `${price.toFixed(2)} €`;
}

// Formater les dates relatives (Just now, 5 min ago, etc.)
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

// Formater une date complète
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculer le statut du stock
export function getStockStatus(stock: number, threshold: number): 'ok' | 'low' | 'out' {
  if (stock === 0) return 'out';
  if (stock <= threshold) return 'low';
  return 'ok';
}

// Couleurs prédéfinies pour les catégories
export const CATEGORY_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

// Calculer le pourcentage de variation
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Obtenir les timestamps pour début et fin de période
export function getPeriodTimestamps(period: 'week' | 'month'): { start: number; end: number; previousStart: number; previousEnd: number } {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  if (period === 'week') {
    const weekStart = now - (7 * day);
    const previousWeekStart = weekStart - (7 * day);
    return {
      start: weekStart,
      end: now,
      previousStart: previousWeekStart,
      previousEnd: weekStart,
    };
  } else {
    const monthStart = now - (30 * day);
    const previousMonthStart = monthStart - (30 * day);
    return {
      start: monthStart,
      end: now,
      previousStart: previousMonthStart,
      previousEnd: monthStart,
    };
  }
}
