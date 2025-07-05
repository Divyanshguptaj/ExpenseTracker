export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM format
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
}

export interface DashboardSummary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  monthlyExpenses: MonthlyExpense[];
  categoryBreakdown: CategoryExpense[];
  recentTransactions: Transaction[];
}