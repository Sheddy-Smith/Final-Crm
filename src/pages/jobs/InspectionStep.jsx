


import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PlusCircle, Trash2, Edit, Save, X } from "lucide-react";

const InspectionStep = () => {
  // Vehicle details
  const [details, setDetails] = useState({
    vehicleNo: "",
    ownerName: "",
    inspectionDate: "",
    branch: "",
  });

  // Inspection items
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("inspectionItems");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Categories from Category Manager (localStorage)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("categories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync categories dynamically
  useEffect(() => {
    const loadCats = () => {
      try {
        const saved = localStorage.getItem("categories");
        setCategories(saved ? JSON.parse(saved) : []);
      } catch {
        setCategories([]);
      }
    };
    loadCats();

    const onCats = () => loadCats();
    const onStorage = (e) => { if (e.key === "categories") loadCats(); };

    window.addEventListener("categoriesUpdated", onCats);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("categoriesUpdated", onCats);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Editing / new row state
  const [editingIndex, setEditingIndex] = useState(null);
  const [newItem, setNewItem] = useState(null);

  // Default multipliers
  const multipliers = {
    Hardware: 2,
    Steel: 1.5,
    Labour: 2,
    Parts: 1.5,
  };

  // Save items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("inspectionItems", JSON.stringify(items));
    } catch {}
  }, [items]);

  // Vehicle details handlers
  const handleDetailChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });
  const saveDetails = () => { alert("Vehicle details saved!"); };

  // Add / edit / delete row
  const addRow = () => setNewItem({ item: "", category: "", condition: "OK", cost: "0", multiplier: 1 });

  const saveNewRow = () => {
    if (!newItem || !newItem.item?.trim()) { alert("Enter item name."); return; }
    setItems([...items, newItem]);
    setNewItem(null);
  };

  const editRow = (index) => setEditingIndex(index);

  const saveEditRow = (index) => {
    const it = items[index];
    if (!it || !it.item?.trim()) { alert("Item cannot be empty."); return; }
    setEditingIndex(null);
  };

  const deleteRow = (index) => setItems(items.filter((_, i) => i !== index));

  // Calculate total with multiplier (manual or default)
  const calculateTotal = (item) => {
    const cost = parseFloat(item?.cost) || 0;
    const multiplier = parseFloat(item?.multiplier) || multipliers[item?.category?.trim()] || 1;
    return (cost * multiplier).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Vehicle Inspection</h3>

      {/* Vehicle Details */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label>Vehicle No:</label>
            <input type="text" name="vehicleNo" value={details.vehicleNo} onChange={handleDetailChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>
          <div>
            <label>Owner Name:</label>
            <input type="text" name="ownerName" value={details.ownerName} onChange={handleDetailChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>
          <div>
            <label>Inspection Date:</label>
            <input type="date" name="inspectionDate" value={details.inspectionDate} onChange={handleDetailChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>
          <div>
            <label>Branch:</label>
            <input type="text" name="branch" value={details.branch} onChange={handleDetailChange} className="w-full mt-1 p-2 border rounded-lg" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={saveDetails}><Save className="h-4 w-4 mr-2" /> Save Details</Button>
        </div>
      </Card>

      {/* Inspection Items */}
      <Card title="Inspection Items">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-2">Item</th>
                <th className="p-2">Category</th>
                <th className="p-2">Condition</th>
                <th className="p-2">Cost (₹)</th>
                <th className="p-2">Multiplier</th>
                <th className="p-2">Total (₹)</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, index) =>
                editingIndex === index ? (
                  <tr key={index} className="bg-blue-50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={it.item}
                        onChange={(e) => { const copy = [...items]; copy[index] = { ...copy[index], item: e.target.value }; setItems(copy); }}
                        list="items-list"
                        placeholder="Type or select item"
                        className="w-full p-1 border rounded-lg"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={it.category}
                        onChange={(e) => { const copy = [...items]; copy[index] = { ...copy[index], category: e.target.value }; setItems(copy); }}
                        list="items-list"
                        placeholder="Type or select category"
                        className="w-full p-1 border rounded-lg"
                      />
                    </td>
                    <td className="p-2">
                      <select value={it.condition} onChange={(e) => { const copy = [...items]; copy[index] = { ...copy[index], condition: e.target.value }; setItems(copy); }} className="w-full p-1 border rounded-lg">
                        <option>OK</option>
                        <option>Repair Needed</option>
                        <option>Replace</option>
                        <option>Damage</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input type="number"
                        value={it.cost}
                        onChange={(e) => { const copy = [...items]; copy[index] = { ...copy[index], cost: e.target.value }; setItems(copy); }}
                        className="w-24 p-1 border rounded-lg"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={it.multiplier ?? multipliers[it.category] ?? 1}
                        onChange={(e) => { const copy = [...items]; copy[index] = { ...copy[index], multiplier: parseFloat(e.target.value) || 1 }; setItems(copy); }}
                        className="w-24 p-1 border rounded-lg"
                        placeholder="Multiplier"
                      />
                    </td>
                    <td className="p-2">{calculateTotal(it)}</td>
                    <td className="p-2 text-right space-x-1">
                      <Button variant="ghost" onClick={() => saveEditRow(index)}><Save className="h-4 w-4 text-green-600" /></Button>
                      <Button variant="ghost" onClick={() => setEditingIndex(null)}><X className="h-4 w-4 text-gray-600" /></Button>
                    </td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td className="p-2">{it.item}</td>
                    <td className="p-2">{it.category}</td>
                    <td className="p-2">{it.condition}</td>
                    <td className="p-2">{it.cost}</td>
                    <td className="p-2">{it.multiplier ?? multipliers[it.category] ?? 1}</td>
                    <td className="p-2">{calculateTotal(it)}</td>
                    <td className="p-2 text-right space-x-1">
                      <Button variant="ghost" onClick={() => editRow(index)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                      <Button variant="ghost" onClick={() => deleteRow(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </td>
                  </tr>
                )
              )}

              {newItem && (
                <tr className="bg-blue-50">
                  <td className="p-2">
                    <input type="text" value={newItem.item} onChange={(e) => setNewItem({ ...newItem, item: e.target.value })} list="items-list" placeholder="Type or select item" className="w-full p-1 border rounded-lg" />
                  </td>
                  <td className="p-2">
                    <input type="text" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} list="items-list" placeholder="Type or select category" className="w-full p-1 border rounded-lg" />
                  </td>
                  <td className="p-2">
                    <select value={newItem.condition} onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })} className="w-full p-1 border rounded-lg">
                      <option>OK</option>
                      <option>Repair Needed</option>
                      <option>Replace</option>
                      <option>Damage</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="number" value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })} className="w-24 p-1 border rounded-lg" />
                  </td>
                  <td className="p-2">
                    <input type="number" value={newItem.multiplier ?? multipliers[newItem.category] ?? 1} onChange={(e) => setNewItem({ ...newItem, multiplier: parseFloat(e.target.value) || 1 })} className="w-24 p-1 border rounded-lg" placeholder="Multiplier" />
                  </td>
                  <td className="p-2">{calculateTotal(newItem)}</td>
                  <td className="p-2 text-right space-x-1">
                    <Button variant="ghost" onClick={saveNewRow}><Save className="h-4 w-4 text-green-600" /></Button>
                    <Button variant="ghost" onClick={() => setNewItem(null)}><X className="h-4 w-4 text-gray-600" /></Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {items.length === 0 && !newItem && <div className="text-center p-4 text-gray-500">No inspection items.</div>}
        </div>

        <div className="mt-4">
          <Button variant="secondary" onClick={addRow} disabled={!!newItem}><PlusCircle className="h-4 w-4 mr-2" /> Add Item</Button>
        </div>
      </Card>

      {/* Datalist for suggestions only from Category Manager */}
      <datalist id="items-list">
        {categories.map((cat, i) => <option key={i} value={cat.name} />)}
      </datalist>
    </div>
  );
};

export default InspectionStep;
