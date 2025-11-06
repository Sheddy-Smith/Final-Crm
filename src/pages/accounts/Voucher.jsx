







import React, { useState, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import SearchBar from "../../components/common/SearchBar";

const Voucher = () => {
  const [vouchers, setVouchers] = useState(() => {
    const saved = localStorage.getItem("vouchers");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [filteredVouchers, setFilteredVouchers] = useState([]);

  useEffect(() => {
    const filtered =
      activeTab === "All" ? vouchers : vouchers.filter((v) => v.type === activeTab);
    setFilteredVouchers(filtered);
  }, [activeTab, vouchers]);

  const [id, setId] = useState(null);
  const [type, setType] = useState("Vendor");
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("UPI");
  const [upi, setUpi] = useState("");
  const [bankAcc, setBankAcc] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    localStorage.setItem("vouchers", JSON.stringify(vouchers));
  }, [vouchers]);

  const resetForm = () => {
    setId(null);
    setType("Vendor");
    setParty("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setMethod("UPI");
    setUpi("");
    setBankAcc("");
    setNotes("");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!party || !amount) return alert("Please fill required fields!");

    const voucherObj = {
      id: id || Date.now(),
      type,
      party,
      amount: Number(amount),
      date,
      method,
      upi: method === "UPI" ? upi : "",
      bankAcc: method === "Bank" ? bankAcc : "",
      notes,
    };

    if (id) {
      setVouchers(vouchers.map((v) => (v.id === id ? voucherObj : v)));
    } else {
      setVouchers([...vouchers, voucherObj]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (v) => {
    setId(v.id);
    setType(v.type);
    setParty(v.party);
    setAmount(v.amount);
    setDate(v.date);
    setMethod(v.method);
    setUpi(v.upi);
    setBankAcc(v.bankAcc);
    setNotes(v.notes);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setVouchers(vouchers.filter((v) => v.id !== id));
  };

  const handleSearch = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    const baseFiltered =
      activeTab === "All" ? vouchers : vouchers.filter((v) => v.type === activeTab);
    const filtered = baseFiltered.filter(
      (v) =>
        v.party.toLowerCase().includes(term) ||
        v.type.toLowerCase().includes(term) ||
        v.method.toLowerCase().includes(term)
    );
    setFilteredVouchers(filtered);
  };

  const handleResetSearch = () => {
    const filtered =
      activeTab === "All" ? vouchers : vouchers.filter((v) => v.type === activeTab);
    setFilteredVouchers(filtered);
  };

  // --- Totals ---
  const totalAll = vouchers.reduce((sum, v) => sum + v.amount, 0);
  const totalVendor = vouchers
    .filter((v) => v.type === "Vendor")
    .reduce((sum, v) => sum + v.amount, 0);
  const totalLabour = vouchers
    .filter((v) => v.type === "Labour")
    .reduce((sum, v) => sum + v.amount, 0);
  const totalSupplier = vouchers
    .filter((v) => v.type === "Supplier")
    .reduce((sum, v) => sum + v.amount, 0);

  const currentTotal =
    activeTab === "All"
      ? totalAll
      : activeTab === "Vendor"
      ? totalVendor
      : activeTab === "Labour"
      ? totalLabour
      : totalSupplier;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Vouchers</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          + New Voucher
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onReset={handleResetSearch}
        searchFields={['party', 'type', 'method']}
      />

      {/* Tabs */}
      <div className="flex gap-2">
        {["All", "Vendor", "Labour", "Supplier"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1 rounded ${
              activeTab === t ? "bg-red-500 text-white" : "bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Total Section
      <div className="bg-gray-100 p-3 rounded text-right font-semibold">
        {activeTab === "All" && (
          <>
            <p>Total (All): ₹{totalAll}</p>
            <p>Vendor Total: ₹{totalVendor}</p>
            <p>Labour Total: ₹{totalLabour}</p>
            <p>Supplier Total: ₹{totalSupplier}</p>
          </>
        )}
        {activeTab !== "All" && (
          <p>
            Total ({activeTab}): ₹{currentTotal}
          </p>
        )}
      </div> */}

      {/* Table */}
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
              <th className="border p-2">Edit</th>
              <th className="border p-2">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.map((v) => (
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
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(v)}
                    className="px-2 py-1 text-yellow-500 rounded"
                  >
                    <Edit />
                  </button>
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="px-2 py-1 text-red-500 rounded"
                  >
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredVouchers.length === 0 && (
              <tr>
                <td colSpan="8" className="text-gray-500 p-4">
                  No vouchers
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96 space-y-3">
            <h3 className="text-lg font-bold">
              {id ? "Edit Voucher" : "New Voucher"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option>Vendor</option>
                <option>Labour</option>
                <option>Supplier</option>
              </select>

              <input
                list="party-list"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                placeholder="Party Name"
                className="w-full p-2 border rounded"
              />

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full p-2 border rounded"
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
              />

              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option>UPI</option>
                <option>Bank</option>
                <option>Cash</option>
                <option>Manual</option>
              </select>

              {method === "UPI" && (
                <input
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="UPI ID"
                  className="w-full p-2 border rounded"
                />
              )}

              {method === "Bank" && (
                <input
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  placeholder="Bank Account / IFSC"
                  className="w-full p-2 border rounded"
                />
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                >
                  {id ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 border py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


  {/* Total Section */}
      <div className="bg-gray-100 p-3 rounded text-right font-semibold">
        {activeTab === "All" && (
          <>
          
            <p>Vendor Total: ₹{totalVendor}</p>
            <p>Labour Total: ₹{totalLabour}</p>
            <p>Supplier Total: ₹{totalSupplier}</p>
              <p>Total (All): ₹{totalAll}</p>
          </>
        )}
        {activeTab !== "All" && (
          <p>
            Total ({activeTab}): ₹{currentTotal}
          </p>
        )}
      </div>



    </div>
  );
};

export default Voucher;
