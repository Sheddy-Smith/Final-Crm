import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import SearchBar from "../../components/common/SearchBar";

const SellChallan = () => {
  const [ledgerRows, setLedgerRows] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showKacchePopup, setShowKacchePopup] = useState(false);

  const [newRow, setNewRow] = useState({
    category: "",
    item: "",
    condition: "",
    cost: "",
    multiplier: "",
    workBy: "",
    notes: "",
  });

  const [newChallan, setNewChallan] = useState({
    customerName: "",
    date: "",
    payment: "",
    amountReceived: "",
    totalAmount: "",
    notes: "",
  });

  const [selectedRow, setSelectedRow] = useState(null);
  const [savedBills, setSavedBills] = useState([]);
  const [kaccheChallans, setKaccheChallans] = useState([]);
  const [filteredKaccheChallans, setFilteredKaccheChallans] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const estimateData = JSON.parse(localStorage.getItem("jobSheetEstimate") || "[]");
    const extraData = JSON.parse(localStorage.getItem("extraWork") || "[]");
    const storedCustomers = JSON.parse(localStorage.getItem("customerLedgerExtra") || "[]");
    const storedBills = JSON.parse(localStorage.getItem("customerBills") || "[]");
    const storedKacche = JSON.parse(localStorage.getItem("kaccheChallans") || "[]");
    const disc = parseFloat(localStorage.getItem("estimateDiscount")) || 0;

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
    setKaccheChallans(storedKacche);
    setFilteredKaccheChallans(storedKacche);
  }, []);

  useEffect(() => {
    setFilteredKaccheChallans(kaccheChallans);
  }, [kaccheChallans]);

  // Delete ledger row
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

  // Add new customer row
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
  };

  // Add new Kacche Challan
  const handleAddKaccheChallan = () => {
    if (!newChallan.customerName || !newChallan.date || !newChallan.totalAmount) {
      alert("Please fill required fields (Customer Name, Date, Total Amount)");
      return;
    }

    const updated = [...kaccheChallans, newChallan];
    setKaccheChallans(updated);
    localStorage.setItem("kaccheChallans", JSON.stringify(updated));

    setNewChallan({
      customerName: "",
      date: "",
      payment: "",
      amountReceived: "",
      totalAmount: "",
      notes: "",
    });
    setShowKacchePopup(false);
  };

  // Totals
  const subtotalEstimate = ledgerRows
    .filter((r) => r.source === "estimate")
    .reduce((acc, item) => acc + parseFloat(item.total || 0), 0);

  const subtotalExtra = ledgerRows
    .filter((r) => r.source === "extraWork")
    .reduce((acc, item) => acc + parseFloat(item.total || 0), 0);

  const subtotalAdded = ledgerRows
    .filter((r) => r.source === "addedCustomer")
    .reduce((acc, item) => acc + parseFloat(item.total || 0), 0);

  const kaccheTotal = kaccheChallans.reduce(
    (acc, ch) => acc + parseFloat(ch.totalAmount || 0),
    0
  );

  const grandTotal = subtotalEstimate + subtotalExtra + subtotalAdded - discount;

  const handleSearch = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    const filtered = kaccheChallans.filter(
      (ch) =>
        ch.customerName.toLowerCase().includes(term) ||
        ch.payment.toLowerCase().includes(term) ||
        (ch.notes && ch.notes.toLowerCase().includes(term))
    );
    setFilteredKaccheChallans(filtered);
  };

  const handleReset = () => {
    setFilteredKaccheChallans(kaccheChallans);
  };

  return (
    <div className="space-y-4 p-4 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold mb-2">Challan Data</h3>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddPopup(true)}>Add Customer</Button>
          <Button onClick={() => setShowKacchePopup(true)}>Add Sell Challan</Button>
        </div>
      </div>

      {/* Add Customer Popup */}
      {showAddPopup && (
        <Card className="absolute left-[200px] p-4 mb-4 bg-gray-50 border border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            {["category", "item", "condition", "cost", "multiplier", "workBy", "notes"].map(
              (field) => (
                <input
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={newRow[field]}
                  type={field === "cost" || field === "multiplier" ? "number" : "text"}
                  onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value })}
                  className={`border p-1 ${field === "notes" ? "col-span-2" : ""}`}
                />
              )
            )}
          </div>
          <div className="flex justify-end mt-2 gap-2">
            <Button variant="destructive" onClick={() => setShowAddPopup(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>Add</Button>
          </div>
        </Card>
      )}

      {/* Add Kacche-Challan Popup */}
      {showKacchePopup && (
        <Card className="absolute left-[200px] p-4 mb-4 bg-gray-50 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Kacche-Challan</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "customerName", label: "Customer Name" },
              { name: "date", label: "Date", type: "date" },
              { name: "payment", label: "Payment Mode" },
              { name: "amountReceived", label: "Amount Received (₹)", type: "number" },
              { name: "totalAmount", label: "Total Amount (₹)", type: "number" },
              { name: "notes", label: "Notes" },
            ].map((field) => (
              <input
                key={field.name}
                type={field.type || "text"}
                placeholder={field.label}
                value={newChallan[field.name]}
                onChange={(e) => setNewChallan({ ...newChallan, [field.name]: e.target.value })}
                className={`border p-1 ${field.name === "notes" ? "col-span-2" : ""}`}
              />
            ))}
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <Button variant="destructive" onClick={() => setShowKacchePopup(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddKaccheChallan}>Save</Button>
          </div>
        </Card>
      )}

      {/* Ledger Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Category</th>
                <th className="border p-2">Item</th>
                <th className="border p-2">Condition</th>
                <th className="border p-2 text-right">Cost (₹)</th>
                <th className="border p-2 text-right">Multiplier</th>
                <th className="border p-2 text-right">Total (₹)</th>
                <th className="border p-2">Work By</th>
                <th className="border p-2">Names</th>
                <th className="border p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-3 text-gray-500">
                    No Ledger Data Found
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                    <td className="border p-2">{row.category}</td>
                    <td className="border p-2">{row.item}</td>
                    <td className="border p-2">{row.condition || "OK"}</td>
                    <td className="border p-2 text-right">{parseFloat(row.cost).toFixed(2)}</td>
                    <td className="border p-2 text-right">{parseFloat(row.multiplier).toFixed(2)}</td>
                    <td className="border p-2 text-right">{parseFloat(row.total).toFixed(2)}</td>
                    <td className="border p-2">{row.workBy || "Labour"}</td>
                    <td className="border p-2">{row.notes || ""}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-800"
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

        <div className="mt-4 text-right font-semibold space-y-1">
          <div>Subtotal (Estimate): ₹{subtotalEstimate.toFixed(2)}</div>
          <div>Subtotal (Extra Work): ₹{subtotalExtra.toFixed(2)}</div>
          <div>Subtotal (Added Customers): ₹{subtotalAdded.toFixed(2)}</div>
          <div>Estimate Discount: ₹{discount.toFixed(2)}</div>
          <div className="font-extrabold text-lg">Grand Total: ₹{grandTotal.toFixed(2)}</div>
        </div>
      </Card>

      {/* Kacche-Challan List */}
      {kaccheChallans.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold mb-2">Kacche-Challan List</h3>
          {/* Search Bar for Kacche Challan */}
          <SearchBar
            onSearch={handleSearch}
            onReset={handleReset}
            searchFields={['customer name', 'payment', 'notes']}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Customer Name</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Payment</th>
                  <th className="border p-2">Amount Received (₹)</th>
                  <th className="border p-2">Total Amount (₹)</th>
                  <th className="border p-2">Notes</th>
                  <th className="border p-2 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredKaccheChallans.map((ch, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-2">{ch.customerName}</td>
                    <td className="border p-2">{ch.date}</td>
                    <td className="border p-2">{ch.payment}</td>
                    <td className="border p-2 text-right">{ch.amountReceived}</td>
                    <td className="border p-2 text-right">{ch.totalAmount}</td>
                    <td className="border p-2">{ch.notes}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => {
                          const updated = kaccheChallans.filter((_, idx) => idx !== i);
                          setKaccheChallans(updated);
                          localStorage.setItem("kaccheChallans", JSON.stringify(updated));
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Kacche Challan Total Row */}
                <tr className="font-bold bg-gray-100">
                  <td colSpan="4" className="text-right border p-2">
                    Total (Kacche-Challan):
                  </td>
                  <td className="border p-2 text-right">
                    ₹{kaccheTotal.toFixed(2)}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Saved Bills */}
      {savedBills.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold mb-2">Saved Bills / Payments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Payment Mode</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Amount (₹)</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Item</th>
                  <th className="border p-2 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {savedBills.map((bill, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border p-2">{bill.customerName}</td>
                    <td className="border p-2">{bill.date}</td>
                    <td className="border p-2">{bill.paymentMode}</td>
                    <td className="border p-2">{bill.paymentStatus}</td>
                    <td className="border p-2 text-right">
                      {parseFloat(bill.amountReceived || bill.totalAmount).toFixed(2)}
                    </td>
                    <td className="border p-2">{bill.category}</td>
                    <td className="border p-2">{bill.item}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => {
                          const updatedBills = savedBills.filter((_, index) => index !== i);
                          setSavedBills(updatedBills);
                          localStorage.setItem("customerBills", JSON.stringify(updatedBills));
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SellChallan;
