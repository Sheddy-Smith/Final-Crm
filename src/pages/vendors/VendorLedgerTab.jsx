
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PlusCircle, Trash2, Save } from "lucide-react";

const VendorLedgerTab = () => {
  // Voucher se data aa raha hai Vendore ka
  const [VendorData, setVendorData] = useState([]);

  // Ledger
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    const savedLedger = JSON.parse(localStorage.getItem("vendorLedger") || "[]");
    setLedger(savedLedger);
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
  };

  const handlePaymentChange = (id, value) => {
    const updated = ledger.map((item) =>
      item.id === id ? { ...item, paymentStatus: value } : item
    );
    setLedger(updated);
    localStorage.setItem("vendorLedger", JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updated = ledger.filter((item) => item.id !== id);
      setLedger(updated);
      localStorage.setItem("vendorLedger", JSON.stringify(updated));
    }
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

  // localStorage se sirf Vendor type ke voucher fetch karna
  useEffect(() => {
    const vouchers = JSON.parse(localStorage.getItem("vouchers")) || [];
    const VendorVouchers = vouchers.filter((v) => v.type === "Vendor");
    setVendorData(VendorVouchers);
  }, []);

  // ✅ Vendor Voucher Total Calculation
  const vendorVoucherTotal = VendorData.reduce(
    (acc, v) => acc + (parseFloat(v.amount) || 0),
    0
  );

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Vendor Ledger (JobSheet)</h3>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={syncFromJobSheet}>
              <Save className="h-4 w-4 mr-2" /> Sync from Job Sheet
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Item</th>
                <th className="py-2 px-4 border-b">Condition</th>
                <th className="py-2 px-4 border-b">Cost (₹)</th>
                <th className="py-2 px-4 border-b">Multiplier</th>
                <th className="py-2 px-4 border-b">Total (₹)</th>
                <th className="py-2 px-4 border-b">Work By</th>
                <th className="py-2 px-4 border-b">Notes</th>
                <th className="py-2 px-4 border-b">Payment</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center p-4 text-gray-500">
                    No Vendor entries.
                  </td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">
                      <input
                        value={item.category}
                        onChange={(e) =>
                          handleFieldChange(item.id, "category", e.target.value)
                        }
                        className="border-none w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={item.item}
                        onChange={(e) =>
                          handleFieldChange(item.id, "item", e.target.value)
                        }
                        className="border-none w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={item.condition}
                        onChange={(e) =>
                          handleFieldChange(item.id, "condition", e.target.value)
                        }
                        className="border-none w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.cost}
                        onChange={(e) =>
                          handleFieldChange(item.id, "cost", e.target.value)
                        }
                        className="border-none w-24 p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 text-center">{item.multiplier}</td>
                    <td className="p-2 text-center">
                      {calculateTotal(item).toFixed(2)}
                    </td>
                    <td className="p-2 text-center">{item.workBy}</td>
                    <td className="p-2">
                      <input
                        value={item.notes}
                        onChange={(e) =>
                          handleFieldChange(item.id, "notes", e.target.value)
                        }
                        className="border-none w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 text-center text-sm">
                      <select
                        value={item.paymentStatus}
                        onChange={(e) =>
                          handlePaymentChange(item.id, e.target.value)
                        }
                        className="border-none p-1 border rounded text-sm"
                      >
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </td>
                    <td className="p-2 flex justify-center gap-2">
                      <button onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-right mt-4 font-bold text-lg">
          Final Total: ₹
          {ledger.reduce((acc, item) => acc + calculateTotal(item), 0).toFixed(2)}
        </div>
      </Card>

      {/* ✅ Card 2 Vendor Voucher Data with Total */}
      <Card className="mt-6">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4"> Vedor Ledger  (Voucher Data)</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Party</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Method</th>
                  <th className="border p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {VendorData.map((v) => (
                  <tr key={v.id} className="text-center">
                    <td className="border p-2">{v.type}</td>
                    <td className="border p-2">{v.party}</td>
                    <td className="border p-2">₹{v.amount}</td>
                    <td className="border p-2">{v.date}</td>
                    <td className="border p-2">{v.method}</td>
                    <td className="border p-2">
                      {v.method === "UPI"
                        ? v.upi
                        : v.method === "Bank"
                        ? v.bankAcc
                        : "-"}
                    </td>
                  </tr>
                ))}
                {VendorData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-gray-500 p-4">
                      No Vendor vouchers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Total below the Vendor Voucher table */}
          <div className="text-right mt-4 font-bold text-lg">
            Voucher Total: ₹{vendorVoucherTotal.toFixed(2)}
          </div>
        </div>
      </Card>
    </>
  );
};

export default VendorLedgerTab;
