
import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";

const CategoryManager = () => {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : [];
  });

  const [newCategory, setNewCategory] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");

  // ✅ Save categories automatically to localStorage
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // ➕ Add new category
  const handleAdd = () => {
    if (!newCategory.trim()) return alert("Please enter a category name!");

    const alreadyExists = categories.some(
      (c) => c.name.toLowerCase() === newCategory.toLowerCase()
    );
    if (alreadyExists) return alert("Category already exists!");

    const updated = [...categories, { name: newCategory }];
    setCategories(updated);
    setNewCategory("");
  };

  // 🗑️ Delete category
  const handleDelete = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  // ✏️ Edit category
  const handleEdit = (index, name) => {
    setEditIndex(index);
    setEditName(name);
  };

  // 💾 Save edited category
  const handleSave = () => {
    if (!editName.trim()) return alert("Enter a valid name!");
    const updated = categories.map((cat, i) =>
      i === editIndex ? { name: editName } : cat
    );
    setCategories(updated);
    setEditIndex(null);
    setEditName("");
  };

  return (
    <Card>
      <div className="p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Category Manager</h2>
        <p className="text-sm font-bold mb-2 text-red-500">
          Add Your Categories in First Capital Letter
        </p>

        <div className="flex mb-4 gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category"
            className="border p-2 flex-1"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">S.No</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={index}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  {editIndex === index ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border p-1"
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="border p-2 flex gap-2">
                  {editIndex === index ? (
                    <button
                      onClick={handleSave}
                      className="bg-green-500 text-white px-2 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(index, cat.name)}
                      className="bg-yellow-500 text-white px-2 rounded"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="text-center p-4 text-gray-500"
                >
                  No categories added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CategoryManager;
