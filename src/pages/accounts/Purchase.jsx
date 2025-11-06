

// final code and completed
import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash } from "lucide-react";

const Purchase = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // LocalStorage se data load
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem("materials");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Steel Rods",
            qty: 50,
            price: 2000,
            supplier: "Indore Steel Co.",
            payment: "Paid",
            category: "Raw Material",
            source: "Local Market",
            vehicleNo: "MP09-AB-1234",
            date: new Date().toISOString().split("T")[0],
          },
        ];
  });

  // LocalStorage me save karna
  useEffect(() => {
    localStorage.setItem("materials", JSON.stringify(materials));
  }, [materials]);

  // Form states
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [payment, setPayment] = useState("Pending");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [date, setDate] = useState("");

  // Reset form
  const resetForm = () => {
    setName("");
    setQty("");
    setPrice("");
    setSupplier("");
    setPayment("Pending");
    setCategory("");
    setSource("");
    setVehicleNo("");
    setDate("");
    setEditingId(null);
  };

  // Stock Movements me data save karne ka function
  const saveToStockMovements = (material) => {
    const stockData = JSON.parse(localStorage.getItem("stockMovements")) || [];
    const newStockRow = {
      date: material.date || new Date().toISOString().split("T")[0],
      type: "In",
      item: material.name,
      linkedTo: material.category || "",
      qty: Number(material.qty) || 0,
      cost: Number(material.price) || 0,
      total: (Number(material.qty) || 0) * (Number(material.price) || 0),
      referral: "Purchase Invoice",
    };

    const updatedStock = [...stockData, newStockRow];
    localStorage.setItem("stockMovements", JSON.stringify(updatedStock));
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // Edit mode
      const updated = materials.map((m) =>
        m.id === editingId
          ? {
              ...m,
              name,
              qty: Number(qty),
              price: Number(price),
              supplier,
              payment,
              category,
              source,
              vehicleNo,
              date,
            }
          : m
      );
      setMaterials(updated);

      const editedMaterial = updated.find((m) => m.id === editingId);
      saveToStockMovements(editedMaterial);
    } else {
      // Add mode
      const newMaterial = {
        id: materials.length + 1,
        name,
        qty: Number(qty),
        price: Number(price),
        supplier,
        payment,
        category,
        source,
        vehicleNo,
        date,
      };
      setMaterials([...materials, newMaterial]);
      saveToStockMovements(newMaterial);
    }

    resetForm();
    setOpen(false);
  };

  // Edit button
  const handleEdit = (m) => {
    setEditingId(m.id);
    setName(m.name);
    setQty(m.qty);
    setPrice(m.price);
    setSupplier(m.supplier);
    setPayment(m.payment);
    setCategory(m.category);
    setSource(m.source);
    setVehicleNo(m.vehicleNo);
    setDate(m.date);
    setOpen(true);
  };

  // Delete button
  const handleDelete = (id) => {
    const filtered = materials.filter((m) => m.id !== id);
    setMaterials(filtered);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Purchase-Invoice</h2>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white flex px-6 py-2 gap-[5px] font-bold rounded hover:bg-blue-700"
        >
          <PlusCircle /> Add
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">Material</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Supplier</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Source</th>
              <th className="p-2 border">vehicleNo</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Edit</th>
              <th className="p-2 border">Delete</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 text-center">
                <td className="p-2 border">{m.id}</td>
                <td className="p-2 border">{m.name}</td>
                <td className="p-2 border">{m.qty}</td>
                <td className="p-2 border">{m.price}₹</td>
                <td className="p-2 border">{m.supplier}</td>
                <td className="p-2 border">{m.payment}</td>
                <td className="p-2 border">{m.category}</td>
                <td className="p-2 border">{m.source}</td>
                <td className="p-2 border">{m.vehicleNo}</td>
                <td className="p-2 border">{m.date}</td>
                <td className="p-2 border">
                  <button onClick={() => handleEdit(m)}>
                    <Edit className="text-yellow-500" />
                  </button>
                </td>
                <td className="p-2 border">
                  <button onClick={() => handleDelete(m.id)}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center mt-10">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg font-bold">
                {editingId ? "Edit Material" : "Add Material"}
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

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Material Name"
                className="w-full border p-2 rounded"
                required
              />
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
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier"
                className="w-full border p-2 rounded"
              />
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Source of Material"
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="vehicleNo"
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />

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

export default Purchase;
