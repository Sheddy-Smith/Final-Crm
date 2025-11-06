import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Trash2, Eye, Search, Filter, TrendingUp, TrendingDown, DollarSign, Users, Clock, Plus, X } from "lucide-react";
import CustomerLedgerDisplay from "@/components/customer/CustomerLedgerDisplay";
import { toast } from 'sonner';

const CustomerLedger = () => {
  const [ledgerRows, setLedgerRows] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [savedBills, setSavedBills] = useState([]);
  const [showLedgerDisplay, setShowLedgerDisplay] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentMode, setFilterPaymentMode] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState(null);

  const [vehicleSearch, setVehicleSearch] = useState("");
  const [challanInvoices, setChallanInvoices] = useState([]);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showBillPopup, setShowBillPopup] = useState(false);

  const [newRow, setNewRow] = useState({
    category: "",
    item: "",
    condition: "",
    cost: "",
    multiplier: "",
    workBy: "",
    notes: "",
  });

  const [selectedRow, setSelectedRow] = useState(null);

  const [billDetails, setBillDetails] = useState({
    customerName: "",
    date: "",
    paymentStatus: "Unpaid",
    paymentMode: "Cash",
    amountReceived: "",
    totalAmount: "",
    notes: "",
  });

  useEffect(() => {
    const estimateData = JSON.parse(localStorage.getItem("jobSheetEstimate") || "[]");
    const extraData = JSON.parse(localStorage.getItem("extraWork") || "[]");
    const storedCustomers = JSON.parse(localStorage.getItem("customerLedgerExtra") || "[]");
    const disc = parseFloat(localStorage.getItem("estimateDiscount")) || 0;
    const storedBills = JSON.parse(localStorage.getItem("customerBills") || "[]");

    const transformedRows = [
      ...estimateData.map((item) => ({
        ...item,
        total: (parseFloat(item.cost || 0) * parseFloat(item.multiplier || 1)).toFixed(2),
        source: "estimate",
      })),
      ...extraData.map((item) => ({
        ...item,
        total: (parseFloat(item.cost || 0) * parseFloat(item.multiplier || 1)).toFixed(2),
        source: "extraWork",
      })),
      ...storedCustomers.map((item) => ({ ...item, source: "addedCustomer" })),
    ];

    setLedgerRows(transformedRows);
    setDiscount(disc);
    setSavedBills(storedBills);

    const challans = JSON.parse(localStorage.getItem("sellChallans") || "[]");
    const invoices = JSON.parse(localStorage.getItem("sellInvoices") || "[]");

    const combinedData = [
      ...challans.map(c => ({ ...c, type: 'Challan', docNo: c.challanNo || 'N/A' })),
      ...invoices.map(i => ({ ...i, type: 'Invoice', docNo: i.invoiceNo || 'N/A' }))
    ];

    setChallanInvoices(combinedData);
  }, []);

  const handleDelete = (index) => {
    const updated = [...ledgerRows];
    const removed = updated.splice(index, 1)[0];
    setLedgerRows(updated);

    if (removed.source === "addedCustomer") {
      const storedCustomers = JSON.parse(localStorage.getItem("customerLedgerExtra") || "[]");
      const filtered = storedCustomers.filter(
        (r) =>
          !(
            r.category === removed.category &&
            r.item === removed.item &&
            r.cost === removed.cost &&
            r.multiplier === removed.multiplier
          )
      );
      localStorage.setItem("customerLedgerExtra", JSON.stringify(filtered));
    }
  };

  const handleAddCustomer = () => {
    const total = (parseFloat(newRow.cost || 0) * parseFloat(newRow.multiplier || 1)).toFixed(2);
    const rowToAdd = { ...newRow, total, source: "addedCustomer" };

    const updatedRows = [...ledgerRows, rowToAdd];
    setLedgerRows(updatedRows);

    const storedCustomers = JSON.parse(localStorage.getItem("customerLedgerExtra") || "[]");
    localStorage.setItem("customerLedgerExtra", JSON.stringify([...storedCustomers, rowToAdd]));

    setNewRow({
      category: "",
      item: "",
      condition: "",
      cost: "",
      multiplier: "",
      workBy: "",
      notes: "",
    });
    setShowAddPopup(false);
    toast.success("Customer entry added successfully!");
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setShowViewPopup(true);
  };

  const handleOpenBill = () => {
    setBillDetails({
      customerName: selectedRow?.workBy || "",
      date: new Date().toISOString().split("T")[0],
      paymentStatus: "Unpaid",
      paymentMode: "Cash",
      amountReceived: "",
      totalAmount: selectedRow?.total || "",
      notes: selectedRow?.notes || "",
    });
    setShowBillPopup(true);
  };

  const handleSaveBill = () => {
    const updatedBills = [
      ...savedBills,
      {
        ...billDetails,
        category: selectedRow?.category || "",
        item: selectedRow?.item || "",
      },
    ];
    setSavedBills(updatedBills);
    localStorage.setItem("customerBills", JSON.stringify(updatedBills));
    setShowBillPopup(false);
    toast.success("Bill saved successfully!");
  };

  const handleViewCustomerLedger = (customerName) => {
    setSelectedCustomer({
      name: customerName,
      customerName: customerName,
      phone: 'N/A',
      gst: 'N/A',
      address: 'N/A',
      city: 'N/A',
    });
    setShowLedgerDisplay(true);
  };

  const uniqueCustomers = [...new Set(savedBills.map(bill => bill.customerName))];

  const filteredCustomers = uniqueCustomers.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBills = savedBills.filter(bill => {
    const matchesSearch = selectedCustomerName ? bill.customerName === selectedCustomerName : true;
    const matchesStatus = filterStatus === "all" || bill.paymentStatus === filterStatus;
    const matchesPaymentMode = filterPaymentMode === "all" || bill.paymentMode === filterPaymentMode;
    return matchesSearch && matchesStatus && matchesPaymentMode;
  });

  const getCustomerSummary = (customerName) => {
    const customerBills = savedBills.filter(b => b.customerName === customerName);
    const totalAmount = customerBills.reduce((sum, bill) => sum + parseFloat(bill.amountReceived || bill.totalAmount || 0), 0);
    const paidBills = customerBills.filter(b => b.paymentStatus === "Paid").length;
    const unpaidBills = customerBills.filter(b => b.paymentStatus === "Unpaid").length;
    const lastTransaction = customerBills.length > 0 ? customerBills[customerBills.length - 1].date : 'N/A';

    return { totalAmount, paidBills, unpaidBills, lastTransaction, totalBills: customerBills.length };
  };

  const globalStats = {
    totalCustomers: uniqueCustomers.length,
    totalRevenue: savedBills.reduce((sum, bill) => sum + parseFloat(bill.amountReceived || bill.totalAmount || 0), 0),
    totalPaid: savedBills.filter(b => b.paymentStatus === "Paid").reduce((sum, bill) => sum + parseFloat(bill.amountReceived || bill.totalAmount || 0), 0),
    totalUnpaid: savedBills.filter(b => b.paymentStatus === "Unpaid").reduce((sum, bill) => sum + parseFloat(bill.amountReceived || bill.totalAmount || 0), 0),
  };

  const subtotalEstimate = ledgerRows
    .filter((r) => r.source === "estimate")
    .reduce((acc, item) => acc + parseFloat(item.total || 0), 0);

  const subtotalExtra = ledgerRows
    .filter((r) => r.source === "extraWork")
    .reduce((acc, item) => acc + parseFloat(item.total || 0), 0);

  const subtotalAdded = ledgerRows
    .filter((r) => r.source === "addedCustomer")
    .reduce((acc, item) => acc + parseFloat(item.total || 0), 0);

  const grandTotal = subtotalEstimate + subtotalExtra + subtotalAdded - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Ledger</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage customer accounts and transactions</p>
          </div>
          <Button onClick={() => setShowAddPopup(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={18} /> Add Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Customers</p>
                <p className="text-3xl font-bold mt-1">{globalStats.totalCustomers}</p>
              </div>
              <Users size={40} className="opacity-80" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">₹{globalStats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign size={40} className="opacity-80" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Paid Amount</p>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customers</h2>
              <Button
                onClick={() => setSelectedCustomerName(null)}
                variant="outline"
                size="sm"
                className={!selectedCustomerName ? 'bg-blue-50 dark:bg-blue-900' : ''}
              >
                All
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCustomers.map((customerName, idx) => {
                const summary = getCustomerSummary(customerName);
                const isSelected = selectedCustomerName === customerName;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedCustomerName(customerName)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{customerName}</h3>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomerLedger(customerName);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Total</p>
                        <p className="font-semibold text-blue-600">₹{summary.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Bills</p>
                        <p className="font-semibold">{summary.totalBills}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Status</p>
                        <p className="text-xs">
                          <span className="text-green-600">{summary.paidBills}P</span> / <span className="text-red-600">{summary.unpaidBills}U</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Last</p>
                        <p className="text-xs font-medium">{summary.lastTransaction}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No customers found</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedCustomerName ? `${selectedCustomerName}'s Transactions` : 'All Transactions'}
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
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                  <select
                    value={filterPaymentMode}
                    onChange={(e) => setFilterPaymentMode(e.target.value)}
                    className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All Payment Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Mode</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBills.map((bill, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{bill.customerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{bill.date}</td>
                      <td className="px-4 py-3 text-sm">{bill.category}</td>
                      <td className="px-4 py-3 text-sm">{bill.item}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-right">
                        ₹{parseFloat(bill.amountReceived || bill.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.paymentMode === 'Cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {bill.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewCustomerLedger(bill.customerName)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            title="View Ledger"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              const updatedBills = savedBills.filter((_, index) => index !== i);
                              setSavedBills(updatedBills);
                              localStorage.setItem("customerBills", JSON.stringify(updatedBills));
                              toast.success("Transaction deleted");
                            }}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBills.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Clock size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">Try adjusting your filters or add a new entry</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Sell Challan & Invoice Movement</h3>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by Vehicle No. or Customer Name..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Doc No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle Model</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Total Amount (₹)</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {challanInvoices
                  .filter(item => {
                    const searchLower = vehicleSearch.toLowerCase();
                    return (
                      item.vehicleNumber?.toLowerCase().includes(searchLower) ||
                      item.customerName?.toLowerCase().includes(searchLower) ||
                      item.name?.toLowerCase().includes(searchLower)
                    );
                  })
                  .map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type === 'Challan'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{item.docNo}</td>
                      <td className="px-4 py-3 text-sm">{item.date || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-medium">{item.customerName || item.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs">
                          {item.vehicleNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.vehicleModel || item.model || 'N/A'}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-blue-600">
                        ₹{parseFloat(item.totalAmount || item.grandTotal || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewCustomerLedger(item.customerName || item.name)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="View Customer Ledger"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {challanInvoices.filter(item => {
              const searchLower = vehicleSearch.toLowerCase();
              return (
                item.vehicleNumber?.toLowerCase().includes(searchLower) ||
                item.customerName?.toLowerCase().includes(searchLower) ||
                item.name?.toLowerCase().includes(searchLower)
              );
            }).length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Clock size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No challan or invoice found</p>
                <p className="text-sm">Create sell challans or invoices from the Accounts section</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-right font-semibold space-y-1">
            <div className="text-sm text-gray-500">
              Total Documents: {challanInvoices.filter(item => {
                const searchLower = vehicleSearch.toLowerCase();
                return (
                  item.vehicleNumber?.toLowerCase().includes(searchLower) ||
                  item.customerName?.toLowerCase().includes(searchLower) ||
                  item.name?.toLowerCase().includes(searchLower)
                );
              }).length}
            </div>
            <div className="text-xl text-blue-600">
              Total Value: ₹{challanInvoices
                .filter(item => {
                  const searchLower = vehicleSearch.toLowerCase();
                  return (
                    item.vehicleNumber?.toLowerCase().includes(searchLower) ||
                    item.customerName?.toLowerCase().includes(searchLower) ||
                    item.name?.toLowerCase().includes(searchLower)
                  );
                })
                .reduce((sum, item) => sum + parseFloat(item.totalAmount || item.grandTotal || 0), 0)
                .toFixed(2)}
            </div>
          </div>
        </Card>
      </div>

      {showLedgerDisplay && selectedCustomer && (
        <CustomerLedgerDisplay
          customer={selectedCustomer}
          onClose={() => {
            setShowLedgerDisplay(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-2xl bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Entry</h3>
              <button onClick={() => setShowAddPopup(false)} className="text-red-500">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["category", "item", "condition", "cost", "multiplier", "workBy", "notes"].map((field) => (
                <input
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={newRow[field]}
                  type={field === "cost" || field === "multiplier" ? "number" : "text"}
                  onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value })}
                  className={`border p-2 rounded dark:bg-gray-700 dark:border-gray-600 ${field === "notes" ? "col-span-2" : ""}`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setShowAddPopup(false)} variant="outline">Cancel</Button>
              <Button onClick={handleAddCustomer}>Add Entry</Button>
            </div>
          </Card>
        </div>
      )}

      {showViewPopup && selectedRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-xl bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Entry Details</h3>
              <button onClick={() => setShowViewPopup(false)} className="text-red-500">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["category", "item", "condition", "cost", "multiplier", "total", "workBy", "notes"].map((field) => (
                <div key={field} className={`p-3 border rounded dark:border-gray-700 ${field === "notes" ? "col-span-2" : ""}`}>
                  <strong className="text-sm text-gray-500">{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
                  <p className="mt-1 font-medium">{selectedRow[field]}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleOpenBill}>Create Bill</Button>
            </div>
          </Card>
        </div>
      )}

      {showBillPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-xl bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create Bill</h3>
              <button onClick={() => setShowBillPopup(false)} className="text-red-500">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3">
              {["customerName", "date", "paymentStatus", "paymentMode", "amountReceived", "totalAmount", "notes"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">
                    {field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </label>
                  {field === "paymentStatus" ? (
                    <select
                      value={billDetails[field]}
                      onChange={(e) => setBillDetails({ ...billDetails, [field]: e.target.value })}
                      className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option>Paid</option>
                      <option>Unpaid</option>
                    </select>
                  ) : field === "paymentMode" ? (
                    <select
                      value={billDetails[field]}
                      onChange={(e) => setBillDetails({ ...billDetails, [field]: e.target.value })}
                      className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option>Cash</option>
                      <option>Online</option>
                    </select>
                  ) : (
                    <input
                      type={field === "date" ? "date" : "text"}
                      value={billDetails[field]}
                      onChange={(e) => setBillDetails({ ...billDetails, [field]: e.target.value })}
                      className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setShowBillPopup(false)} variant="outline">Cancel</Button>
              <Button onClick={handleSaveBill}>Save Bill</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
