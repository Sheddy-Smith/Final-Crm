



// // completed and final code
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Trash2, Eye } from "lucide-react";
import CustomerLedgerDisplay from "@/components/customer/CustomerLedgerDisplay";

const CustomerLedger = () => {
  const [ledgerRows, setLedgerRows] = useState([]);
  const [discount, setDiscount] = useState(0);

  // Popups
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

  // Bill / Payment details
  const [billDetails, setBillDetails] = useState({
    customerName: "",
    date: "",
    paymentStatus: "Unpaid",
    paymentMode: "Cash",
    amountReceived: "",
    totalAmount: "",
    notes: "",
  });

  const [savedBills, setSavedBills] = useState([]);
  const [showLedgerDisplay, setShowLedgerDisplay] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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

  // ✅ Fixed version — Category & Item save with bill
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

  return (
    <div className="space-y-4 p-4 relative">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold mb-2">Customer Ledger</h3>
      <Button onClick={() => setShowAddPopup(true)}>Add Customer</Button>
      </div>
        <h3 className="text-xl font-bold mb-2">Jobs sheet (Challan) </h3>

      {showLedgerDisplay && selectedCustomer && (
        <CustomerLedgerDisplay
          customer={selectedCustomer}
          onClose={() => {
            setShowLedgerDisplay(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {/* Add Customer Popup */}
      {showAddPopup && (
        <Card className="p-4 mb-4 bg-gray-50 border">
          <div className="grid grid-cols-2 gap-2">
            {["category","item","condition","cost","multiplier","workBy","notes"].map((field) => (
              <input
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={newRow[field]}
                type={field==="cost"||field==="multiplier"?"number":"text"}
                onChange={(e) => setNewRow({ ...newRow, [field]: e.target.value })}
                className={`border p-1 ${field==="notes"?"col-span-2":""}`}
              />
            ))}
          </div>
          <div className="flex justify-end mt-2 gap-2">
            <Button onClick={() => setShowAddPopup(false)} variant="destructive">Cancel</Button>
            <Button onClick={handleAddCustomer}>Add</Button>
          </div>
        </Card>
      )}

      {/* View Row Popup */}
      {showViewPopup && selectedRow && (
        <Card className="p-4 mb-4 bg-gray-50 border-4 absolute top-[130px] right-[350px] z-20">
          <div className="grid grid-cols-2 gap-2">
            {["category",
            "item",
            "condition",
            "cost",
            "multiplier",
            "total",
            "workBy",
            "notes"].map((field) => (
              <div key={field} className={`border p-2 ${field==="notes"?"col-span-2":""}`}>
                <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {selectedRow[field]}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-lg">
            <Button onClick={handleOpenBill}>Open</Button>
            <Button onClick={() => setShowViewPopup(false)}>X</Button>
          </div>
        </Card>
      )}

      {/* Bill / Payment Popup */}
      {showBillPopup && (
        <Card className="p-6 bg-white shadow-lg border-4 absolute top-[150px] right-[200px] z-30 w-[400px]">
          <h2 className="text-xl font-bold mb-4">Customer Bill / Payment Details</h2>
          <div className="space-y-2">
            {["customerName","date","paymentStatus","paymentMode","amountReceived","totalAmount","notes"].map((field) => (
              <div key={field} className="flex flex-col">
                <label className="font-semibold text-sm">
                  {field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </label>
                {field === "paymentStatus" ? (
                  <select
                    value={billDetails[field]}
                    onChange={(e) => setBillDetails({ ...billDetails, [field]: e.target.value })}
                    className="border p-1 rounded"
                  >
                    <option>Paid</option>
                    <option>Unpaid</option>
                  </select>
                ) : field === "paymentMode" ? (
                  <select
                    value={billDetails[field]}
                    onChange={(e) => setBillDetails({ ...billDetails, [field]: e.target.value })}
                    className="border p-1 rounded"
                  >
                    <option>Cash</option>
                    <option>Online</option>
                  </select>
                ) : (
                  <input
                    type={field === "date" ? "date" : "text"}
                    value={billDetails[field]}
                    onChange={(e) => setBillDetails({ ...billDetails, [field]: e.target.value })}
                    className="border p-1 rounded"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-2 mt-4">
            <Button onClick={() => setShowBillPopup(false)} variant="destructive">X</Button>
            <Button onClick={handleSaveBill}>Save</Button>
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
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(row)}
                  >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(index);
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

        <div className="mt-4 text-right font-semibold space-y-1">
          <div>Subtotal (Estimate): ₹{subtotalEstimate.toFixed(2)}</div>
          <div>Subtotal (Extra Work): ₹{subtotalExtra.toFixed(2)}</div>
          <div>Subtotal (Added Customers): ₹{subtotalAdded.toFixed(2)}</div>
          <div>Estimate Discount: ₹{discount.toFixed(2)}</div>
          <div className="font-extrabold text-lg">Grand Total: ₹{grandTotal.toFixed(2)}</div>
        </div>
      </Card>



{/* Second Challan card  Cash Receipt Data */}
 
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
 


 
      




{/* ---------------- Cash Receipt Data ---------------- */}
<Card>
<div className="mt-8">
  <h2 className="text-lg font-bold mb-3">Cash Receipt Data</h2>

  <div className="overflow-x-auto border rounded-lg">
    <table className="min-w-full border-collapse">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Name</th>
          <th className="border p-2">Purpose</th>
          <th className="border p-2">Payment Type</th>
          <th className="border p-2">Amount (₹)</th>
          <th className="border p-2">Status</th>
          <th className="border p-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {(() => {
          const receipts = JSON.parse(localStorage.getItem("cashReceipts")) || [];
          if (receipts.length === 0) {
            return (
              <tr>
                <td colSpan="6" className="text-gray-500 p-4 text-center">
                  No Cash Receipts Found.
                </td>
              </tr>
            );
          }

          const total = receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);

          return (
            <>
              {receipts.map((r) => (
                <tr key={r.id} className="text-center hover:bg-gray-50">
                  <td className="border p-2">{r.name}</td>
                  <td className="border p-2">{r.purpose}</td>
                  <td className="border p-2">{r.paymentType}</td>
                  <td className="border p-2">₹{r.amount}</td>
                  <td
                    className={`border p-2 font-medium ${
                      r.status === "Deposited" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {r.status}
                  </td>
                  <td className="border p-2">{r.date}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-gray-200 font-semibold text-center">
                <td colSpan="3" className="border p-2 text-right">
                  Total:
                </td>
                <td className="border p-2">₹{total}</td>
                <td colSpan="2"></td>
              </tr>
            </>
          );
        })()}
      </tbody>
    </table>
  </div>
</div>
<Card/>



{/* End */}


  
</Card>



{/* End */}

 {/* ✅ Saved Bills Table */}
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
                  <th className="border p-2 text-center">View Ledger</th>
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
                    <td className="border p-2">{parseFloat(bill.amountReceived || bill.totalAmount).toFixed(2)}</td>
                    <td className="border p-2">{bill.category}</td>
                    <td className="border p-2">{bill.item}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleViewCustomerLedger(bill.customerName)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                        title="View Full Ledger"
                      >
                        <Eye />
                      </button>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => {
                          const updatedBills = savedBills.filter((_, index) => index !== i);
                          setSavedBills(updatedBills);
                          localStorage.setItem("customerBills", JSON.stringify(updatedBills));
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                      <Trash2/>
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

export default CustomerLedger;













