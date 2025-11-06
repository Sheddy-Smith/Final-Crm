



import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash } from "lucide-react";

const Challan = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);

  // 🔹 Load Categories from localStorage (CategoryManager.js se)
  useEffect(() => {
    const saved = localStorage.getItem("categories");
    if (saved) setCategories(JSON.parse(saved));

    // Event listener for category updates
    const handleUpdate = () => {
      const updated = localStorage.getItem("categories");
      if (updated) setCategories(JSON.parse(updated));
    };
    window.addEventListener("categoriesUpdated", handleUpdate);

    return () => {
      window.removeEventListener("categoriesUpdated", handleUpdate);
    };
  }, []);

  // 🔹 Load Challans from localStorage
  const [challans, setChallans] = useState(() => {
    const saved = localStorage.getItem("challans");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            challanNo: "CH-001",
            date: "2025-09-13",
            source: "Indore Supplier",
            item: "Cement Bags",
            qty: 100,
            price: 350,
            total: 35000,
            payment: "Pending",
          },
        ];
  });

  // 🔹 Save Challans to localStorage
  useEffect(() => {
    localStorage.setItem("challans", JSON.stringify(challans));
  }, [challans]);

  // Form States
  const [challanNo, setChallanNo] = useState("");
  const [date, setDate] = useState("");
  const [source, setSource] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [payment, setPayment] = useState("Pending");

  // 🔹 Reset Form
  const resetForm = () => {
    setChallanNo("");
    setDate("");
    setSource("");
    setItem("");
    setQty("");
    setPrice("");
    setPayment("Pending");
    setEditingId(null);
  };

  // 🔹 Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    const total = Number(qty) * Number(price);

    if (editingId) {
      const updated = challans.map((c) =>
        c.id === editingId
          ? {
              id: editingId,
              challanNo,
              date,
              source,
              item,
              qty: Number(qty),
              price: Number(price),
              total,
              payment,
            }
          : c
      );
      setChallans(updated);
    } else {
      const newChallan = {
        id: challans.length + 1,
        challanNo,
        date,
        source,
        item,
        qty: Number(qty),
        price: Number(price),
        total,
        payment,
      };
      setChallans([...challans, newChallan]);
    }

    resetForm();
    setOpen(false);
  };

  // 🔹 Edit Challan
  const handleEdit = (c) => {
    setEditingId(c.id);
    setChallanNo(c.challanNo);
    setDate(c.date);
    setSource(c.source);
    setItem(c.item);
    setQty(c.qty);
    setPrice(c.price);
    setPayment(c.payment);
    setOpen(true);
  };

  // 🔹 Delete Challan
  const handleDelete = (id) => {
    const filtered = challans.filter((c) => c.id !== id);
    setChallans(filtered);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Purchase Challan</h2>
        <button
          onClick={() => setOpen(true)}
          className="bg-red-600 text-white flex px-6 py-2 gap-2 font-bold rounded hover:bg-red-700"
        >
          <PlusCircle /> Add  Purchase-Challan
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Challan No</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Source</th>
              <th className="p-2 border">Item (Category)</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Edit</th>
              <th className="p-2 border">Delete</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 text-center">
                <td className="p-2 border">{c.id}</td>
                <td className="p-2 border">{c.challanNo}</td>
                <td className="p-2 border">{c.date}</td>
                <td className="p-2 border">{c.source}</td>
                <td className="p-2 border">{c.item}</td>
                <td className="p-2 border">{c.qty}</td>
                <td className="p-2 border">{c.price}₹</td>
                <td className="p-2 border">{c.total}₹</td>
                <td className="p-2 border">{c.payment}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEdit(c)}>
                    <Edit className="text-yellow-500" />
                  </button>
                </td>
                <td className="p-2 border">
                  <button onClick={() => handleDelete(c.id)}>
                    <Trash className="text-red-800" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingId ? "Edit Challan" : "Add Challan"}
              </h3>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="text-red-500 font-semibold"
              >
                X
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                placeholder="Challan No"
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Source"
                className="w-full border p-2 rounded"
                required
              /> 

              {/* 🔹 Item dropdown linked with categories */}
              <input
                list="categoryList"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="Select Categories from Categories List"
                className="w-full border p-2 rounded"
                required
              />
              <datalist id="categoryList">
                {categories.map((cat, i) => (
                  <option key={i} value={cat.name} />
                ))}
              </datalist>

              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Quantity"
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="w-full border p-2 rounded"
                required
              />
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challan;
