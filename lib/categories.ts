import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#FF6B6B', icon: 'utensils' },
  { id: '2', name: 'Transportation', color: '#4ECDC4', icon: 'car' },
  { id: '3', name: 'Shopping', color: '#45B7D1', icon: 'shopping-bag' },
  { id: '4', name: 'Entertainment', color: '#96CEB4', icon: 'film' },
  { id: '5', name: 'Bills & Utilities', color: '#FFEAA7', icon: 'zap' },
  { id: '6', name: 'Healthcare', color: '#DDA0DD', icon: 'heart' },
  { id: '7', name: 'Education', color: '#98D8C8', icon: 'book' },
  { id: '8', name: 'Travel', color: '#F7DC6F', icon: 'plane' },
  { id: '9', name: 'Income', color: '#58D68D', icon: 'trending-up' },
  { id: '10', name: 'Other', color: '#85C1E9', icon: 'more-horizontal' },
];

export const getCategoryColor = (categoryName: string): string => {
  const category = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName);
  return category?.color || '#85C1E9';
};

export const getCategoryIcon = (categoryName: string): string => {
  const category = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName);
  return category?.icon || 'more-horizontal';
};