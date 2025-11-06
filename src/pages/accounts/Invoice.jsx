// // Invoice.jsx
import { Edit,  Trash2Icon ,Trash2, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import Card  from "../../components/ui/Card";
const INVOICES_KEY = "malwa_invoices_v1";
const SUPPLIER_LEDGER_KEY = "malwa_supplier_ledger_v1";

const todayISO = () => new Date().toISOString().split("T")[0];

const Badge = ({ children, color = "gray" }) => (
  <span
    className={`inline-block px-2 py-0.5 text-xs rounded bg-${color}-100 text-${color}-700`}
  >
    {children}
  </span>
);

const Invoice = () => {
  // --- UI State ---
  const [showForm, setShowForm] = useState(false);

  // --- Data State ---
  const [invoices, setInvoices] = useState(() => {
    const raw = localStorage.getItem(INVOICES_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  const [ledger, setLedger] = useState(() => {
    const raw = localStorage.getItem(SUPPLIER_LEDGER_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  // --- Form State ---
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState(0);
  const [gst, setGst] = useState(18);
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState("Pending");

  const [editingId, setEditingId] = useState(null);

  // --- Derived total ---
  const baseTotal = qty * rate;
  const gstAmount = (baseTotal * gst) / 100;
  const finalTotal = baseTotal + gstAmount;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(SUPPLIER_LEDGER_KEY, JSON.stringify(ledger));
  }, [ledger]);

  const resetForm = () => {
    setSupplier("");
    setItem("");
    setQty(1);
    setRate(0);
    setGst(18);
    setDate(todayISO());
    setStatus("Pending");
    setEditingId(null);
  };

  const nextId = () => {
    if (invoices.length === 0) return 1;
    return Math.max(...invoices.map((i) => i.id)) + 1;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!supplier.trim()) {
      alert("Enter supplier name.");
      return;
    }
    if (!item.trim()) {
      alert("Enter item name.");
      return;
    }

    const invoiceObj = {
      id: editingId || nextId(),
      supplier: supplier.trim(),
      item: item.trim(),
      qty: Number(qty),
      rate: Number(rate),
      gst: Number(gst),
      baseTotal,
      finalTotal,
      date,
      status,
    };

    if (editingId) {
      const updated = invoices.map((i) =>
        i.id === editingId ? invoiceObj : i
      );
      setInvoices(updated);

      setLedger((prev) => {
        const copy = [...prev.filter((l) => l.id !== editingId), invoiceObj];
        return copy;
      });
    } else {
      setInvoices((prev) => [...prev, invoiceObj]);
      setLedger((prev) => [...prev, invoiceObj]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (inv) => {
    setEditingId(inv.id);
    setSupplier(inv.supplier);
    setItem(inv.item);
    setQty(inv.qty);
    setRate(inv.rate);
    setGst(inv.gst);
    setDate(inv.date);
    setStatus(inv.status);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setLedger((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sell-Invoices</h2>
          {/* <p className="text-sm text-gray-600">
            Manage supplier invoices with GST & payment status.
          </p> */}
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Add Sell-Invoice
        </button>
      </div>

      {/* Table */}
      <div className="border rounded shadow-sm bg-white p-4">
        {invoices.length === 0 ? (
          <div className="text-sm text-gray-500">No invoices yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-sm">ID</th>
                  <th className="p-2 border text-sm">Supplier</th>
                  <th className="p-2 border text-sm">Item</th>
                  <th className="p-2 border text-sm">Qty</th>
                  <th className="p-2 border text-sm">Rate</th>
                  <th className="p-2 border text-sm">GST%</th>
                  <th className="p-2 border text-sm">Total</th>
                  <th className="p-2 border text-sm">Final (with GST)</th>
                  <th className="p-2 border text-sm">Date</th>
                  <th className="p-2 border text-sm">Status</th>
                  <th className="p-2 border text-sm">Edit</th>
                  <th className="p-2 border text-sm">Delete</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-2 border text-sm">{inv.id}</td>
                    <td className="p-2 border text-sm">{inv.supplier}</td>
                    <td className="p-2 border text-sm">{inv.item}</td>
                    <td className="p-2 border text-sm">{inv.qty}</td>
                    <td className="p-2 border text-sm">₹{inv.rate}</td>
                    <td className="p-2 border text-sm">{inv.gst}%</td>
                    <td className="p-2 border text-sm">₹{inv.baseTotal}</td>
                    <td className="p-2 border text-sm font-medium">
                      ₹{inv.finalTotal}
                    </td>
                    <td className="p-2 border text-sm">{inv.date}</td>
                    <td className="p-2 border text-sm">
                      <Badge color={inv.status === "Paid" ? "green" : "red"}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-2 border text-sm">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="px-1 py-1 text-sm text-blue-800 rounded"
                      >
                        <Edit/>
                      </button>
                    </td>
                    <td className="p-2 border text-sm">
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="px-2 py-1 text-xs  text-red-700 rounded"
                      >
                     <Trash2Icon/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
          <div className="bg-white rounded-lg shadow-lg w-[92%] max-w-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Invoice" : "New Invoice"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-3 py-1 rounded text-sm bg-gray-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium">Supplier</label>
                <input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter supplier name"
                />
              </div>

              {/* Item */}
              <div>
                <label className="block text-sm font-medium">Item</label>
                <input
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Item details"
                />
              </div>

              {/* Qty & Rate */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium">Quantity</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Rate</label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* GST & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium">GST (%)</label>
                  <input
                    type="number"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Totals */}
              <div className="text-sm text-gray-700">
                <p>Base Total: ₹{baseTotal}</p>
                <p>GST: ₹{gstAmount}</p>
                <p className="font-medium">Final Total: ₹{finalTotal}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {editingId ? "Update Invoice" : "Save Invoice"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


{/* Second page of Invoice copmonent */}


<Card className="mt-6">
  <h4 className="font-bold text-2xl">Invoice Data</h4>

  <div className="overflow-x-auto mt-[10px]">
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Category</th>
          <th className="border p-2">Item</th>
          <th className="border p-2 text-right">Cost (₹)</th>
          <th className="border p-2 text-right">Total (₹)</th>
          <th className="border p-2 text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        {(() => {
          // ✅ Fetch invoices from localStorage
          const invoices = JSON.parse(localStorage.getItem("invoices")) || [];

          // ✅ Combine all invoice items (jobSheetEstimate + extraWork)
          const allItems = invoices.flatMap(inv => [
            ...(inv.items || [])
          ]);

          // ✅ Delete function
          const handleDelete = (index) => {
            if (window.confirm("Are you sure you want to delete this invoice?")) {
              const updatedInvoices = invoices.filter((_, i) => i !== index);
              localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
              window.location.reload();
            }
          };

          if (allItems.length === 0) {
            return (
              <tr>
                <td colSpan="5" className="text-center p-2 text-gray-500">
                  No invoice data available
                </td>
              </tr>
            );
          }

          return allItems.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.category || "—"}</td>
              <td className="border p-2">{item.item || "—"}</td>
              <td className="border p-2 text-right">
                {item.cost ? `₹${item.cost}` : "—"}
              </td>
              <td className="border p-2 text-right">
                {item.total ? `₹${item.total.toFixed(2)}` : "—"}
              </td>
              <td className="border p-2 text-center">
                <Trash2
                  className="h-4 w-4 text-red-500 cursor-pointer inline"
                  onClick={() => handleDelete(index)}
                />
              </td>
            </tr>
          ));
        })()}
      </tbody>
    </table>
  </div>

  {/* ✅ Totals section */}
  <div className="mt-4 text-right font-semibold space-y-1">
    {(() => {
      const invoices = JSON.parse(localStorage.getItem("invoices")) || [];
      const allItems = invoices.flatMap(inv => inv.items || []);
      const subtotal = allItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const gst = subtotal * 0.18;
      const grandTotal = subtotal + gst;

      return (
        <>
          <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
          <div>GST (18%): ₹{gst.toFixed(2)}</div>
          <div className="font-extrabold text-lg">
            Grand Total: ₹{grandTotal.toFixed(2)}
          </div>
        </>
      );
    })()}
  </div>
</Card>







    </div>
  );
};

export default Invoice;


 