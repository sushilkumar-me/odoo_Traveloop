"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Calendar,
  AlertTriangle,
  Building,
  Calculator,
  MapPin,
  Globe,
  Plus,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setTripBudget, addExpense } from "@/lib/actions/budget-actions";
import { useState } from "react";

const CURRENCY = "$"; // Use user's currency ideally, but standardizing to $ for display if mixed
const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#94a3b8", "#f43f5e", "#14b8a6"];

interface BudgetClientProps {
  totalCost: number;
  totalBudget: number;
  remainingBudget: number;
  avgPerDay: number;
  totalDays: number;
  uniqueCitiesCount: number;
  mostExpensiveCity: string;
  cheapestDay: string;
  categoryData: { name: string; value: number; color: string }[];
  dailyData: {
    day: string;
    city: string;
    transport: number;
    stay: number;
    activities: number;
    meals: number;
    total: number;
    dailyBudget: number;
  }[];
  overBudgetDays: any[];
  tripId?: string;
}

export default function BudgetClient({
  totalCost,
  totalBudget,
  remainingBudget,
  avgPerDay,
  totalDays,
  uniqueCitiesCount,
  mostExpensiveCity,
  cheapestDay,
  categoryData,
  dailyData,
  overBudgetDays,
  tripId,
}: BudgetClientProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(totalBudget > 0 ? totalBudget.toString() : "");
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: "", description: "", category: "Transport", date: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    setIsSubmitting(true);
    await setTripBudget(tripId, Number(budgetInput));
    setIsEditingBudget(false);
    setIsSubmitting(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    setIsSubmitting(true);
    await addExpense(tripId, {
      amount: Number(expenseForm.amount),
      description: expenseForm.description,
      category: expenseForm.category,
      date: expenseForm.date,
    });
    setShowExpenseForm(false);
    setExpenseForm({ amount: "", description: "", category: "Transport", date: new Date().toISOString().split('T')[0] });
    setIsSubmitting(false);
  };

  if (totalBudget === 0 && totalCost === 0 && !isEditingBudget && !showExpenseForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-8 border-dashed border-2 shadow-none">
          <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Budget Data Yet</h2>
          <p className="text-gray-500 mb-6">
            Set a budget for your trip or add your first expense to see your financial breakdown here.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setIsEditingBudget(true)} className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white">
              <Wallet className="w-4 h-4 mr-2" />
              Set Total Budget
            </Button>
            <Button onClick={() => setShowExpenseForm(true)} variant="outline" className="text-gray-600">
              <Plus className="w-4 h-4 mr-2" />
              Add First Expense
            </Button>
            {tripId && (
              <Link href={`/dashboard/trips/${tripId}`}>
                <Button variant="ghost" className="w-full text-gray-400">Back to Trip</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            {tripId && (
              <Link href={`/dashboard/trips/${tripId}`}>
                <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900 -ml-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  Back to Itinerary
                </Button>
              </Link>
            )}
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Trip Budget & Cost Breakdown
            </h1>
            <p className="text-gray-500 mt-2">
              Monitor your travel spending, analyze costs, and avoid going over budget.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={() => setIsEditingBudget(!isEditingBudget)} variant="outline" className="text-gray-600 bg-white shadow-sm border-gray-200">
              <Pencil className="w-4 h-4 mr-2" />
              {totalBudget > 0 ? "Edit Budget" : "Set Budget"}
            </Button>
            <Button onClick={() => setShowExpenseForm(!showExpenseForm)} className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white shadow-md shadow-orange-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Dynamic Forms */}
        {isEditingBudget && (
          <Card className="border-[#ff7a1a]/20 shadow-md">
            <CardContent className="p-6">
              <form onSubmit={handleSetBudget} className="flex items-end gap-4 max-w-sm">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Total Trip Budget ({CURRENCY})</label>
                  <Input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={budgetInput} 
                    onChange={(e) => setBudgetInput(e.target.value)} 
                    placeholder="e.g. 5000" 
                  />
                </div>
                <Button disabled={isSubmitting} type="submit" className="bg-[#ff7a1a] hover:bg-[#e66b15] text-white">
                  Save
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsEditingBudget(false)}>Cancel</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {showExpenseForm && (
          <Card className="border-emerald-500/20 shadow-md bg-emerald-50/10">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                Record New Expense
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Amount ({CURRENCY})</label>
                    <Input type="number" required min="0" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="e.g. 45.50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                    <Input required value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="e.g. Train to Rome" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <select 
                      required
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={expenseForm.category} 
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    >
                      <option value="Transport">Transport</option>
                      <option value="Stay">Stay</option>
                      <option value="Meals">Meals</option>
                      <option value="Activities">Activities</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                    <Input type="date" required value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
                  <Button disabled={isSubmitting} type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">Save Expense</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 1. TOTAL TRIP COST SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total Estimated Cost
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {CURRENCY}
                    {totalCost.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Budget</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {CURRENCY}
                    {totalBudget.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Remaining Budget
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      remainingBudget >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {CURRENCY}
                    {remainingBudget.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <PiggyBank className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Avg. Cost / Day
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {CURRENCY}
                    {avgPerDay.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 5. OVER-BUDGET ALERTS */}
        {overBudgetDays.length > 0 && (
          <div className="space-y-3">
            {overBudgetDays.map((day, idx) => (
              <Alert variant="destructive" key={idx} className="bg-red-50 border-red-200">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="text-red-800 font-bold text-base">
                  Over-Budget Alert — {day.day} ({day.city})
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  You spent {CURRENCY}{day.total.toLocaleString("en-US")} which exceeded your daily budget of {CURRENCY}{day.dailyBudget.toLocaleString("en-US")} by <strong>{CURRENCY}{(day.total - day.dailyBudget).toLocaleString("en-US")}</strong>.
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2 & 3. COST BREAKDOWN & PIE CHART */}
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  No expenses added yet
                </div>
              ) : (
                <>
                  <div className="h-64 w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${CURRENCY}${value.toLocaleString("en-US")}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    {categoryData.map((cat) => {
                      const percentage = totalCost > 0 ? ((cat.value / totalCost) * 100).toFixed(1) : 0;
                      return (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-medium text-gray-700">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {CURRENCY}
                              {cat.value.toLocaleString("en-US")}
                            </p>
                            <p className="text-xs text-gray-500">{percentage}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 4. BAR CHART - DAILY SPEND */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Day-wise Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  No daily expenses recorded yet
                </div>
              ) : (
                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280" }}
                        dy={10}
                      />
                      <YAxis
                        tickFormatter={(val) => `${CURRENCY}${val}`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280" }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${CURRENCY}${value.toLocaleString("en-US")}`, "Spent"]}
                        cursor={{ fill: "#f3f4f6" }}
                      />
                      <Legend />
                      <Bar
                        dataKey="total"
                        name="Total Expense"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 7. TRIP SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Days</p>
                <p className="text-xl font-bold">{totalDays}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Building className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Cities</p>
                <p className="text-xl font-bold">{uniqueCitiesCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Most Expensive</p>
                <p className="text-xl font-bold truncate max-w-[120px]" title={mostExpensiveCity}>{mostExpensiveCity || "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cheapest Day</p>
                <p className="text-xl font-bold">{cheapestDay || "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 6. DAILY EXPENSE TABLE */}
        {dailyData.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Daily Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Date</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3 text-right">Transport</th>
                      <th className="px-4 py-3 text-right">Stay</th>
                      <th className="px-4 py-3 text-right">Activities</th>
                      <th className="px-4 py-3 text-right">Meals</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg font-bold">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailyData.map((row) => (
                      <tr key={row.day} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{row.day}</td>
                        <td className="px-4 py-3 text-gray-600">{row.city}</td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {CURRENCY}
                          {row.transport.toLocaleString("en-US")}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {CURRENCY}
                          {row.stay.toLocaleString("en-US")}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {CURRENCY}
                          {row.activities.toLocaleString("en-US")}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {CURRENCY}
                          {row.meals.toLocaleString("en-US")}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {CURRENCY}
                          {row.total.toLocaleString("en-US")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
