'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { MonthlyChart } from '@/components/dashboard/monthly-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionList } from '@/components/transactions/transaction-list';
import { BudgetForm } from '@/components/budget/budget-form';
import { BudgetOverview } from '@/components/budget/budget-overview';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Transaction, Budget, DashboardSummary } from '@/types';
import { getDashboardSummary, getTransactions } from '@/lib/storage';
import { Plus, BarChart3, DollarSign, Target } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Dialog states
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadDashboardData();
    }
  }, [mounted]);

  const loadDashboardData = () => {
    if (!mounted) return;
    
    setIsLoading(true);
    try {
      const dashboardData = getDashboardSummary();
      const transactions = getTransactions();
      setSummary(dashboardData);
      setAllTransactions(transactions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default empty state
      setSummary({
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        monthlyExpenses: [],
        categoryBreakdown: [],
        recentTransactions: [],
      });
      setAllTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSuccess = () => {
    setIsTransactionDialogOpen(false);
    setEditingTransaction(null);
    loadDashboardData();
  };

  const handleBudgetSuccess = () => {
    setIsBudgetDialogOpen(false);
    setEditingBudget(null);
    loadDashboardData();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetDialogOpen(true);
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Tracker</h1>
          <p className="text-gray-600">Track your finances and manage your budget</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {summary && (
              <>
                <SummaryCards
                  totalExpenses={summary.totalExpenses}
                  totalIncome={summary.totalIncome}
                  balance={summary.balance}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <MonthlyChart data={summary.monthlyExpenses} />
                  <CategoryChart data={summary.categoryBreakdown} />
                  <RecentTransactions transactions={summary.recentTransactions} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Transactions</h2>
              <Button onClick={() => setIsTransactionDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
            <TransactionList
              transactions={allTransactions}
              onEdit={handleEditTransaction}
              onUpdate={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Budget Management</h2>
            </div>
            <BudgetOverview
              onEdit={handleEditBudget}
              onAdd={() => setIsBudgetDialogOpen(true)}
              onUpdate={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <TransactionForm onSuccess={handleTransactionSuccess} />
          </TabsContent>
        </Tabs>

        {/* Transaction Dialog */}
        <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction || undefined}
              onSuccess={handleTransactionSuccess}
              onCancel={() => {
                setIsTransactionDialogOpen(false);
                setEditingTransaction(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Budget Dialog */}
        <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Set Monthly Budget'}
              </DialogTitle>
            </DialogHeader>
            <BudgetForm
              budget={editingBudget || undefined}
              onSuccess={handleBudgetSuccess}
              onCancel={() => {
                setIsBudgetDialogOpen(false);
                setEditingBudget(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  );
}