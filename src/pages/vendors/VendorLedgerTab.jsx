import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Trash2, Save, Search, Filter, TrendingUp, TrendingDown, DollarSign, Users, Eye, Plus } from "lucide-react";
import { toast } from 'sonner';

const VendorLedgerTab = () => {
  const [ledger, setLedger] = useState([]);
  const [VendorData, setVendorData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    const savedLedger = JSON.parse(localStorage.getItem("vendorLedger") || "[]");
    setLedger(savedLedger);
  }, []);

  useEffect(() => {
    const vouchers = JSON.parse(localStorage.getItem("vouchers")) || [];
    const VendorVouchers = vouchers.filter((v) => v.type === "Vendor");
    setVendorData(VendorVouchers);
  }, []);

  const syncFromJobSheet = () => {
    const jobSheet = JSON.parse(localStorage.getItem("jobSheetEstimate") || "[]");
    const extraWork = JSON.parse(localStorage.getItem("extraWork") || "[]");

    const vendorItems = [...jobSheet, ...extraWork]
      .filter((item) => item.workBy === "Vendor")
      .map((item) => ({
        ...item,
        paymentStatus: item.paymentStatus || "No",
        id: Math.random().toString(36).substr(2, 9),
      }));

    const merged = [
      ...ledger,
      ...vendorItems.filter((v) => !ledger.find((l) => l.id === v.id)),
    ];

    setLedger(merged);
    localStorage.setItem("vendorLedger", JSON.stringify(merged));
    toast.success("Vendor Ledger synced from Job Sheet!");
  };

  const handlePaymentChange = (id, value) => {
    const updated = ledger.map((item) =>
      item.id === id ? { ...item, paymentStatus: value } : item
    );
    setLedger(updated);
    localStorage.setItem("vendorLedger", JSON.stringify(updated));
    toast.success("Payment status updated!");
  };

  const handleDelete = (id) => {
    const updated = ledger.filter((item) => item.id !== id);
    setLedger(updated);
    localStorage.setItem("vendorLedger", JSON.stringify(updated));
    toast.success("Entry deleted successfully!");
  };

  const handleFieldChange = (id, field, value) => {
    const updated = ledger.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setLedger(updated);
    localStorage.setItem("vendorLedger", JSON.stringify(updated));
  };

  const calculateTotal = (item) => {
    const cost = parseFloat(item.cost) || 0;
    const multiplier = parseFloat(item.multiplier) || 1;
    return cost * multiplier;
  };

  const uniqueVendors = [...new Set(ledger.map(item => item.notes || 'Unknown'))];

  const filteredLedger = ledger.filter(item => {
    const matchesSearch = item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = filterPayment === "all" || item.paymentStatus === filterPayment;
    const matchesVendor = !selectedVendor || item.notes === selectedVendor;
    return matchesSearch && matchesPayment && matchesVendor;
  });

  const getVendorSummary = (vendorName) => {
    const vendorItems = ledger.filter(item => item.notes === vendorName);
    const totalAmount = vendorItems.reduce((sum, item) => sum + calculateTotal(item), 0);
    const paidItems = vendorItems.filter(item => item.paymentStatus === "Yes").length;
    const unpaidItems = vendorItems.filter(item => item.paymentStatus === "No").length;
    return { totalAmount, paidItems, unpaidItems, totalItems: vendorItems.length };
  };

  const vendorVoucherTotal = VendorData.reduce(
    (acc, v) => acc + (parseFloat(v.amount) || 0),
    0
  );

  const globalStats = {
    totalVendors: uniqueVendors.length,
    totalAmount: ledger.reduce((sum, item) => sum + calculateTotal(item), 0),
    totalPaid: ledger.filter(i => i.paymentStatus === "Yes").reduce((sum, item) => sum + calculateTotal(item), 0),
    totalUnpaid: ledger.filter(i => i.paymentStatus === "No").reduce((sum, item) => sum + calculateTotal(item), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Ledger</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage vendor accounts and payments</p>
          </div>
          <Button onClick={syncFromJobSheet} className="bg-blue-600 hover:bg-blue-700">
            <Save size={18} /> Sync from Job Sheet
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Vendors</p>
                <p className="text-3xl font-bold mt-1">{globalStats.totalVendors}</p>
              </div>
              <Users size={40} className="opacity-80" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Amount</p>
                <p className="text-3xl font-bold mt-1">₹{globalStats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign size={40} className="opacity-80" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Paid Amount</p>
                <p className="text-3xl font-bold mt-1">₹{globalStats.totalPaid.toFixed(2)}</p>
              </div>
              <TrendingUp size={40} className="opacity-80" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Unpaid Amount</p>
                <p className="text-3xl font-bold mt-1">₹{globalStats.totalUnpaid.toFixed(2)}</p>
              </div>
              <TrendingDown size={40} className="opacity-80" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vendors</h2>
              <Button
                onClick={() => setSelectedVendor(null)}
                variant="outline"
                size="sm"
                className={!selectedVendor ? 'bg-blue-50 dark:bg-blue-900' : ''}
              >
                All
              </Button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {uniqueVendors.map((vendorName, idx) => {
                const summary = getVendorSummary(vendorName);
                const isSelected = selectedVendor === vendorName;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedVendor(vendorName)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-900 border-purple-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{vendorName}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Total</p>
                        <p className="font-semibold text-purple-600">₹{summary.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Items</p>
                        <p className="font-semibold">{summary.totalItems}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Status</p>
                        <p className="text-xs">
                          <span className="text-green-600">{summary.paidItems}P</span> / <span className="text-red-600">{summary.unpaidItems}U</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {uniqueVendors.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No vendors found</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedVendor ? `${selectedVendor}'s Items` : 'All Vendor Items'}
              </h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowFilters(!showFilters)} variant="outline" size="sm">
                  <Filter size={16} /> Filters
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All Payments</option>
                    <option value="Yes">Paid</option>
                    <option value="No">Unpaid</option>
                  </select>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Condition</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Cost (₹)</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total (₹)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Payment</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLedger.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          value={item.category}
                          onChange={(e) => handleFieldChange(item.id, "category", e.target.value)}
                          className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={item.item}
                          onChange={(e) => handleFieldChange(item.id, "item", e.target.value)}
                          className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={item.condition}
                          onChange={(e) => handleFieldChange(item.id, "condition", e.target.value)}
                          className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => handleFieldChange(item.id, "cost", e.target.value)}
                          className="w-24 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm text-right"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{item.multiplier}</td>
                      <td className="px-4 py-3 text-right font-semibold text-sm">
                        ₹{calculateTotal(item).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={item.paymentStatus}
                          onChange={(e) => handlePaymentChange(item.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-none ${
                            item.paymentStatus === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="No">Unpaid</option>
                          <option value="Yes">Paid</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLedger.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">No vendor items found</p>
                  <p className="text-sm">Sync from job sheet to add vendor items</p>
                </div>
              )}
            </div>

            <div className="mt-4 text-right font-semibold space-y-1">
              <div className="text-xl text-purple-600">
                Filtered Total: ₹{filteredLedger.reduce((sum, item) => sum + calculateTotal(item), 0).toFixed(2)}
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Vendor Voucher Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Party</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {VendorData.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm">{v.type}</td>
                    <td className="px-4 py-3 text-sm font-medium">{v.party}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">₹{v.amount}</td>
                    <td className="px-4 py-3 text-sm">{v.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        v.method === 'Cash' ? 'bg-green-100 text-green-800' :
                        v.method === 'UPI' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {v.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {v.method === "UPI" ? v.upi : v.method === "Bank" ? v.bankAcc : "-"}
                    </td>
                  </tr>
                ))}
                {VendorData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium">No vendor vouchers found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-right font-semibold space-y-1">
            <div className="text-xl text-blue-600">
              Voucher Total: ₹{vendorVoucherTotal.toFixed(2)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorLedgerTab;
