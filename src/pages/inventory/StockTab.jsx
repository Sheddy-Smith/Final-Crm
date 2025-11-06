
// ye direct job sheet se aa raha hai.
import React, { useState, useEffect } from "react";
import { SaveAllIcon, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const StockTab = () => {
  const [rows, setRows] = useState([]);

  // Load from JobSheet (estimate + extraWork) with robust cost/total logic
  useEffect(() => {
    const jobSheetEstimate = JSON.parse(localStorage.getItem("jobSheetEstimate")) || [];
    const extraWork = JSON.parse(localStorage.getItem("extraWork")) || [];

    const combined = [...jobSheetEstimate, ...extraWork];

    const transformedRows = combined.map((r) => {
      // normalize numeric inputs
      const qty = Number.isFinite(parseFloat(r.qty)) ? parseFloat(r.qty) : (Number.isFinite(parseFloat(r.quantity)) ? parseFloat(r.quantity) : 0);
      const cost = Number.isFinite(parseFloat(r.cost)) ? parseFloat(r.cost) : (Number.isFinite(parseFloat(r.rate)) ? parseFloat(r.rate) : 0);
      const multiplier =
        Number.isFinite(parseFloat(r.multiplier)) ? parseFloat(r.multiplier) :
        Number.isFinite(parseFloat(r.mul)) ? parseFloat(r.mul) :
        0;

      // priority for total:
      // 1) if row.total provided and numeric -> use it
      // 2) else if multiplier present -> cost * multiplier (JobSheet style)
      // 3) else if qty present -> cost * qty
      // 4) else fallback to cost
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
        // keep raw numbers so we can format when rendering
        date: new Date().toISOString().split("T")[0],
        type: "In",
        item: r.item || "",
        linkedTo: r.category || r.linkedTo || "",
        qty: qty,     // number (0 if not provided)
        cost: cost,   // number
        total: totalValue, // number
        referral: r.jobSheetNo || r.referral || "JobSheet",
      };
    });

    setRows(transformedRows);
    localStorage.setItem("stockMovements", JSON.stringify(transformedRows));
  }, []);

  // Handle manual type change (In/Out)
  const handleChangeType = (index, value) => {
    const updated = [...rows];
    updated[index].type = value;
    setRows(updated);
    localStorage.setItem("stockMovements", JSON.stringify(updated));
  };

  // Delete row -> update state + localStorage
  const handleDelete = (index) => {
    if (!window.confirm("Are you sure you want to delete this stock row?")) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    localStorage.setItem("stockMovements", JSON.stringify(updated));
  };

  // Save manually (optional)
  const saveToLocalStorage = () => {
    localStorage.setItem("stockMovements", JSON.stringify(rows));
    alert("✅ Stock Movements saved.");
  };

  return (
    <Card className="p-4 mt-2">
      <h2 className="text-lg font-semibold mb-4">📦 Stock Movements</h2>

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
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-3 text-gray-500">
                  No Stock Movement Data Found
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
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

                  <td className="border p-2 text-right">{Number.isFinite(row.qty) ? row.qty : "-"}</td>
                  <td className="border p-2 text-right">{Number.isFinite(row.cost) ? row.cost.toFixed(2) : "-"}</td>
                  <td className="border p-2 text-right">{Number.isFinite(row.total) ? row.total.toFixed(2) : "-"}</td>
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
  );
};

export default StockTab;


