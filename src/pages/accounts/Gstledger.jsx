

import React, { useState, useEffect } from "react";
import SearchBar from "../../components/common/SearchBar";

const GSTLedger = () => {
  // --- Purchase Data ---
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem("materials");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Sell Data ---
  const [sells, setSells] = useState(() => {
    const saved = localStorage.getItem("malwa_invoices_v1");
    return saved ? JSON.parse(saved) : [];
  });

  // Combine both for display
  const ledgerData = [
    ...purchases.map((p) => ({ ...p, type: "Purchase" })),
    ...sells.map((s) => ({
      id: s.id,
      name: s.item,
      qty: s.qty,
      price: s.rate,
      supplier: s.supplier,
      payment: s.status,
      category: "-",
      source: "-",
      vehicleNo: "-",
      date: s.date,
      type: "Sell",
    })),
  ];

  const [filteredLedgerData, setFilteredLedgerData] = useState([]);

  useEffect(() => {
    setFilteredLedgerData(ledgerData);
  }, [purchases, sells]);

  // Delete Function
  const handleDelete = (id, type) => {
    if (!window.confirm("Are you sure to delete?")) return;

    if (type === "Purchase") {
      setPurchases(purchases.filter((p) => p.id !== id));
      localStorage.setItem(
        "materials",
        JSON.stringify(purchases.filter((p) => p.id !== id))
      );
    } else {
      setSells(sells.filter((s) => s.id !== id));
      localStorage.setItem(
        "malwa_invoices_v1",
        JSON.stringify(sells.filter((s) => s.id !== id))
      );
    }
  };

  const handleSearch = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    const filtered = ledgerData.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.supplier.toLowerCase().includes(term) ||
        row.payment.toLowerCase().includes(term) ||
        row.type.toLowerCase().includes(term) ||
        (row.category !== "-" && row.category.toLowerCase().includes(term))
    );
    setFilteredLedgerData(filtered);
  };

  const handleReset = () => {
    setFilteredLedgerData(ledgerData);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        GST Ledger
      </h2>

      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onReset={handleReset}
        searchFields={['material', 'supplier', 'payment', 'type', 'category']}
      />

      <div className="overflow-x-auto shadow rounded-lg bg-white">
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-3 border text-sm text-gray-700">S.No</th>
              <th className="p-3 border text-sm text-gray-700">Material</th>
              <th className="p-3 border text-sm text-gray-700">Quantity</th>
              <th className="p-3 border text-sm text-gray-700">Price</th>
              <th className="p-3 border text-sm text-gray-700">Supplier</th>
              <th className="p-3 border text-sm text-gray-700">Payment</th>
              <th className="p-3 border text-sm text-gray-700">Category</th>
              <th className="p-3 border text-sm text-gray-700">Source</th>
              <th className="p-3 border text-sm text-gray-700">Vehicle No</th>
              <th className="p-3 border text-sm text-gray-700">Date</th>
              <th className="p-3 border text-sm text-gray-700">Type</th>
              <th className="p-3 border text-sm text-gray-700">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedgerData.length === 0 && (
              <tr>
                <td
                  colSpan="12"
                  className="text-center p-4 text-gray-500 font-medium"
                >
                  No records available
                </td>
              </tr>
            )}

            {filteredLedgerData.map((row, index) => (
              <tr
                key={`${row.type}-${row.id}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border text-center">{row.name}</td>
                <td className="p-2 border text-center">{row.qty}</td>
                <td className="p-2 border text-center">₹{row.price}</td>
                <td className="p-2 border text-center">{row.supplier}</td>
                <td className="p-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      row.payment === "Paid" ||
                      row.payment === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.payment}
                  </span>
                </td>
                <td className="p-2 border text-center">{row.category}</td>
                <td className="p-2 border text-center">{row.source}</td>
                <td className="p-2 border text-center">{row.vehicleNo}</td>
                <td className="p-2 border text-center">{row.date}</td>
                <td className="p-2 border text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      row.type === "Purchase"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleDelete(row.id, row.type)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GSTLedger;


