'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Budget } from '@/types';
import { getBudgets, getTransactions } from '@/lib/storage';
import { getCategoryColor } from '@/lib/categories';
import { Edit, Trash2, Plus } from 'lucide-react';
import { deleteBudget } from '@/lib/storage';
import { toast } from 'sonner';

interface BudgetOverviewProps {
  onEdit?: (budget: Budget) => void;
  onAdd?: () => void;
  onUpdate?: () => void;
}

export function BudgetOverview({ onEdit, onAdd, onUpdate }: BudgetOverviewProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetComparison, setBudgetComparison] = useState<any[]>([]);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    const storedBudgets = getBudgets();
    const transactions = getTransactions();
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Filter budgets for current month
    const currentBudgets = storedBudgets.filter(budget => budget.month === currentMonth);
    setBudgets(currentBudgets);

    // Calculate budget vs actual spending
    const comparison = currentBudgets.map(budget => {
      const spent = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category && 
          t.date.startsWith(budget.month)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: budget.category,
        budget: budget.amount,
        spent: spent,
        remaining: Math.max(0, budget.amount - spent),
        color: getCategoryColor(budget.category),
      };
    });

    setBudgetComparison(comparison);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        deleteBudget(id);
        toast.success('Budget deleted successfully');
        loadBudgets();
        onUpdate?.();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage <= 60) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Budgets</CardTitle>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No budgets set for this month</p>
              </div>
            ) : (
              budgets.map((budget) => {
                const comparison = budgetComparison.find(c => c.category === budget.category);
                const spent = comparison?.spent || 0;
                const percentage = (spent / budget.amount) * 100;

                return (
                  <Card key={budget.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{budget.category}</h3>
                        <div className="flex space-x-1">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(budget)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(budget.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Spent: {formatCurrency(spent)}</span>
                          <span>Budget: {formatCurrency(budget.amount)}</span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% used</span>
                          <span>
                            {comparison && comparison.remaining > 0 
                              ? `${formatCurrency(comparison.remaining)} remaining`
                              : spent > budget.amount 
                                ? `${formatCurrency(spent - budget.amount)} over budget`
                                : 'Budget met'
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {budgetComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    name === 'budget' ? 'Budget' : 'Spent'
                  ]}
                />
                <Bar dataKey="budget" fill="#e5e7eb" name="budget" />
                <Bar dataKey="spent" fill="#3b82f6" name="spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}