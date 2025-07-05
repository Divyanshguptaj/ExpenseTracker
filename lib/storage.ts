import { Transaction, Budget, DashboardSummary } from '@/types';
import { DEFAULT_CATEGORIES, getCategoryColor } from './categories';

const TRANSACTIONS_KEY = 'expense-tracker-transactions';
const BUDGETS_KEY = 'expense-tracker-budgets';

export const getTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransactions = (transactions: Transaction[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getBudgets = (): Budget[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BUDGETS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveBudgets = (budgets: Budget[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): Transaction | null => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  transactions[index] = { ...transactions[index], ...updates };
  saveTransactions(transactions);
  return transactions[index];
};

export const deleteTransaction = (id: string): boolean => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  if (filtered.length === transactions.length) return false;
  
  saveTransactions(filtered);
  return true;
};

export const addBudget = (budget: Omit<Budget, 'id'>): Budget => {
  const budgets = getBudgets();
  const newBudget: Budget = {
    ...budget,
    id: Date.now().toString(),
  };
  budgets.push(newBudget);
  saveBudgets(budgets);
  return newBudget;
};

export const updateBudget = (id: string, updates: Partial<Budget>): Budget | null => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  budgets[index] = { ...budgets[index], ...updates };
  saveBudgets(budgets);
  return budgets[index];
};

export const deleteBudget = (id: string): boolean => {
  const budgets = getBudgets();
  const filtered = budgets.filter(b => b.id !== id);
  if (filtered.length === budgets.length) return false;
  
  saveBudgets(filtered);
  return true;
};

export const getDashboardSummary = (): DashboardSummary => {
  const transactions = getTransactions();
  const currentDate = new Date();
  
  // Calculate totals
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  
  // Get monthly expenses for the last 6 months
  const monthlyExpenses = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = date.toISOString().substring(0, 7);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const monthTotal = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0);
    
    monthlyExpenses.push({
      month: monthName,
      amount: monthTotal,
    });
  }
  
  // Get category breakdown
  const categoryTotals = new Map<string, number>();
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);
    });
  
  const categoryBreakdown = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);
  
  // Get recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return {
    totalExpenses,
    totalIncome,
    balance,
    monthlyExpenses,
    categoryBreakdown,
    recentTransactions,
  };
};