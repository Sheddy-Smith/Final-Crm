

import { useState, useEffect } from "react";
import { SaveAllIcon, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const StockMovements = () => {
  const [rows, setRows] = useState([]);
  const [purchaseRows, setPurchaseRows] = useState([]); // 👈 new state for Purchase-Invoice data

  // 🔹 JobSheet (estimate + extraWork) data load
  useEffect(() => {
    const jobSheetEstimate = JSON.parse(localStorage.getItem("jobSheetEstimate")) || [];
    const extraWork = JSON.parse(localStorage.getItem("extraWork")) || [];
    const combined = [...jobSheetEstimate, ...extraWork];

    const transformedRows = combined.map((r) => {
      const qty =
        Number.isFinite(parseFloat(r.qty)) ? parseFloat(r.qty) :
        Number.isFinite(parseFloat(r.quantity)) ? parseFloat(r.quantity) : 0;
      const cost =
        Number.isFinite(parseFloat(r.cost)) ? parseFloat(r.cost) :
        Number.isFinite(parseFloat(r.rate)) ? parseFloat(r.rate) : 0;
      const multiplier =
        Number.isFinite(parseFloat(r.multiplier)) ? parseFloat(r.multiplier) :
        Number.isFinite(parseFloat(r.mul)) ? parseFloat(r.mul) : 0;

      let totalValue = 0;
      if (Number.isFinite(parseFloat(r.total))) {
        totalValue = parseFloat(r.total);
      } else if (multiplier > 0) {
        totalValue = cost * multiplier;
      } else if (qty > 0) {
        totalValue = cost * qty;
      } else {
        totalValue = cost;
      }

      return {
        date: new Date().toISOString().split("T")[0],
        type: "In",
        item: r.item || "",
        linkedTo: r.category || r.linkedTo || "",
        qty: qty,
        cost: cost,
        total: totalValue,
        referral: r.jobSheetNo || r.referral || "JobSheet",
      };
    });

    setRows(transformedRows);
    localStorage.setItem("stockMovements", JSON.stringify(transformedRows));
  }, []);

  // 🔹 Load Purchase-Invoice data
  useEffect(() => {
    const materials = JSON.parse(localStorage.getItem("materials")) || [];
    setPurchaseRows(materials);
  }, []);

  // 🔹 Handle type change (JobSheet table)
  const handleChangeType = (index, value) => {
    const updated = [...rows];
    updated[index].type = value;
    setRows(updated);
    localStorage.setItem("stockMovements", JSON.stringify(updated));
  };

  // 🔹 Delete (JobSheet table)
  const handleDelete = (index) => {
    if (!window.confirm("Are you sure you want to delete this stock row?")) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    localStorage.setItem("stockMovements", JSON.stringify(updated));
  };

  // 🔹 Save manually (optional)
  const saveToLocalStorage = () => {
    localStorage.setItem("stockMovements", JSON.stringify(rows));
    alert("✅ Stock Movements saved.");
  };

  return (
    <div>
      {/* 🧾 CARD 1 - Job Sheet Data */}
      <Card className="p-4 mt-2">
        <h2 className="text-lg font-semibold mb-4">📦 Stock Movements (Job Sheet Data)</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Item</th>
                <th className="border p-2">Category</th>
                <th className="border p-2 text-right">Qty</th>
                <th className="border p-2 text-right">Cost</th>
                <th className="border p-2 text-right">Total</th>
                <th className="border p-2">Referral (JobSheet)</th>
                <th className="border p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-3 text-gray-500">
                    No Stock Movement Data Found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{row.date}</td>
                    <td className="border p-2">
                      <select
                        value={row.type}
                        onChange={(e) => handleChangeType(index, e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="In">In</option>
                        <option value="Out">Out</option>
                      </select>
                    </td>
                    <td className="border p-2">{row.item}</td>
                    <td className="border p-2">{row.linkedTo}</td>
                    <td className="border p-2 text-right">{row.qty || "-"}</td>
                    <td className="border p-2 text-right">{row.cost?.toFixed(2) || "-"}</td>
                    <td className="border p-2 text-right">{row.total?.toFixed(2) || "-"}</td>
                    <td className="border p-2">{row.referral}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Row"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={saveToLocalStorage} className="bg-green-600 text-white">
            <SaveAllIcon className="mr-2" /> Save All
          </Button>
        </div>
      </Card>

      {/* 🧾 CARD 2 - Purchase-Invoice Data */}
      <Card className="p-4 mt-2">
        <h2 className="text-lg font-semibold mb-4">
          📦 Stock Movements (Purchase-Invoice Data)
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">S.No</th>
                <th className="border p-2">Material</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Price</th>
                <th className="border p-2 text-right">Supplier</th>
                <th className="border p-2 text-right">Payment</th>
                <th className="border p-2 text-right">Category</th>
                <th className="border p-2">Source</th>
                <th className="border p-2">Vehicle No</th>
                <th className="border p-2">Date</th>
                <th className="border p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRows.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center p-3 text-gray-500">
                    No Purchase-Invoice Data Found
                  </td>
                </tr>
              ) : (
                purchaseRows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">{index + 1}</td>
                    <td className="border p-2">{row.name}</td>
                    <td className="border p-2 text-right">{row.qty}</td>
                    <td className="border p-2 text-right">{row.price}</td>
                    <td className="border p-2 text-right">{row.supplier}</td>
                    <td className="border p-2 text-right">{row.payment}</td>
                    <td className="border p-2 text-right">{row.category}</td>
                    <td className="border p-2">{row.source}</td>
                    <td className="border p-2">{row.vehicleNo}</td>
                    <td className="border p-2">{row.date}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this row?")) {
                            const updated = purchaseRows.filter((_, i) => i !== index);
                            setPurchaseRows(updated);
                            localStorage.setItem("materials", JSON.stringify(updated));
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Row"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => {
              localStorage.setItem("materials", JSON.stringify(purchaseRows));
              alert("✅ Purchase-Invoice Data saved.");
            }}
            className="bg-green-600 text-white"
          >
            <SaveAllIcon className="mr-2" /> Save All
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StockMovements;
