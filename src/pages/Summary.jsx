import Card from "@/components/ui/Card";
import PageHeader from "@/components/PageHeader";
import { Truck, Users, Package, Wrench, BarChart as BarChartIcon, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useJobsStore from '@/store/jobsStore';
import useVendorStore from '@/store/vendorStore';
import useLabourStore from '@/store/labourStore';
import useSupplierStore from '@/store/supplierStore';
import useInventoryStore from '@/store/inventoryStore';
import {
  calculateJobStats,
  calculateRevenue,
  calculateExpenses,
  calculateProfitLoss,
  calculateStockValue,
  calculateTotalPartsUsed,
  formatCurrency
} from '@/utils/dashboardCalculations';
import { useMemo } from 'react';

const Summary = () => {
    const { jobs } = useJobsStore();
    const { vendors } = useVendorStore();
    const { labours } = useLabourStore();
    const { suppliers } = useSupplierStore();
    const { stockItems } = useInventoryStore();

    const jobStats = useMemo(() => calculateJobStats(jobs), [jobs]);
    const totalRevenue = useMemo(() => calculateRevenue(jobs), [jobs]);
    const totalExpenses = useMemo(() => calculateExpenses(jobs, labours, vendors, suppliers), [jobs, labours, vendors, suppliers]);
    const profitLossData = useMemo(() => calculateProfitLoss(jobs), [jobs]);
    const stockValue = useMemo(() => calculateStockValue(stockItems), [stockItems]);
    const totalPartsUsed = useMemo(() => calculateTotalPartsUsed(jobs), [jobs]);

    const vendorCount = Object.keys(vendors).length;
    const labourCount = Object.keys(labours).length;
    const supplierCount = Object.keys(suppliers).length;

    const kpiData = [
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: TrendingUp,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            title: "Total Expenses",
            value: formatCurrency(totalExpenses),
            icon: TrendingDown,
            color: "text-red-500",
            bgColor: "bg-red-50 dark:bg-red-900/20"
        },
        {
            title: "Net Profit/Loss",
            value: formatCurrency(totalRevenue - totalExpenses),
            icon: totalRevenue - totalExpenses >= 0 ? TrendingUp : TrendingDown,
            color: totalRevenue - totalExpenses >= 0 ? "text-green-600" : "text-red-600",
            bgColor: totalRevenue - totalExpenses >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
        },
        {
            title: "Total Vendors",
            value: vendorCount,
            icon: Users,
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            title: "Total Labour",
            value: labourCount,
            icon: Wrench,
            color: "text-green-500",
            bgColor: "bg-green-50 dark:bg-green-900/20"
        },
        {
            title: "Total Suppliers",
            value: supplierCount,
            icon: Package,
            color: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            title: "Total Parts Used",
            value: totalPartsUsed,
            icon: Package,
            color: "text-amber-500",
            bgColor: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            title: "Total Stock Value",
            value: formatCurrency(stockValue),
            icon: BarChartIcon,
            color: "text-indigo-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            title: "Total Jobs Done",
            value: `${jobStats.total} Jobs`,
            icon: Truck,
            color: "text-gray-600",
            bgColor: "bg-gray-50 dark:bg-gray-800"
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Summary Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpiData.map(item => (
                    <Card key={item.title} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">{item.title}</p>
                                <p className="mt-2 text-3xl font-bold text-brand-dark dark:text-dark-text">{item.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${item.bgColor}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <h3 className="text-lg font-bold dark:text-dark-text mb-4">Monthly Profit / Loss Trend</h3>
                {profitLossData.some(item => item.profit !== 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={profitLossData}>
                            <XAxis dataKey="name" stroke="gray" />
                            <YAxis stroke="gray" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: 'rgba(30,30,30,0.9)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white'
                                }}
                            />
                            <Bar dataKey="profit" name="Profit/Loss" radius={[8, 8, 0, 0]}>
                                {profitLossData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#22c55e' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <p>No profit/loss data available</p>
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold dark:text-dark-text mb-4">Job Statistics</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="text-sm font-medium dark:text-dark-text">Jobs In Progress</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{jobStats.inProgress}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-sm font-medium dark:text-dark-text">Jobs Completed</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">{jobStats.completed}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <span className="text-sm font-medium dark:text-dark-text">Pending Approvals</span>
                            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{jobStats.pendingApprovals}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm font-medium dark:text-dark-text">Total Jobs</span>
                            <span className="text-xl font-bold text-gray-600 dark:text-gray-400">{jobStats.total}</span>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold dark:text-dark-text mb-4">Financial Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <span className="text-sm font-medium dark:text-dark-text">Total Revenue</span>
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <span className="text-sm font-medium dark:text-dark-text">Total Expenses</span>
                            <span className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</span>
                        </div>
                        <div className={`flex justify-between items-center p-3 rounded-lg ${
                            totalRevenue - totalExpenses >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                            <span className="text-sm font-medium dark:text-dark-text">Net Profit/Loss</span>
                            <span className={`text-xl font-bold ${
                                totalRevenue - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                                {formatCurrency(totalRevenue - totalExpenses)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm font-medium dark:text-dark-text">Profit Margin</span>
                            <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                {totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Summary;
