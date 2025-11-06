import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useMultiplierStore from '@/store/multiplierStore';
import { Calculator, Users, Truck, Tag, Plus, Trash2, Save, RotateCcw, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

const MultiplierSettingsTab = () => {
  const {
    labourMultiplier,
    vendorMultiplier,
    categoryMultipliers,
    setLabourMultiplier,
    setVendorMultiplier,
    setCategoryMultiplier,
    removeCategoryMultiplier,
    resetMultipliers,
    exportMultipliers,
    importMultipliers,
  } = useMultiplierStore();

  const [labourValue, setLabourValue] = useState(labourMultiplier);
  const [vendorValue, setVendorValue] = useState(vendorMultiplier);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryMultiplier, setNewCategoryMultiplier] = useState(1);
  const [editingCategories, setEditingCategories] = useState({});

  const handleSaveLabour = () => {
    setLabourMultiplier(labourValue);
    toast.success('Labour multiplier saved!');
  };

  const handleSaveVendor = () => {
    setVendorMultiplier(vendorValue);
    toast.success('Vendor multiplier saved!');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    if (categoryMultipliers[newCategoryName]) {
      toast.error('Category already exists');
      return;
    }
    setCategoryMultiplier(newCategoryName, newCategoryMultiplier);
    setNewCategoryName('');
    setNewCategoryMultiplier(1);
    toast.success(`Category "${newCategoryName}" added!`);
  };

  const handleUpdateCategory = (categoryName, value) => {
    setCategoryMultiplier(categoryName, value);
    setEditingCategories({ ...editingCategories, [categoryName]: false });
    toast.success(`Category "${categoryName}" updated!`);
  };

  const handleDeleteCategory = (categoryName) => {
    if (window.confirm(`Are you sure you want to delete multiplier for "${categoryName}"?`)) {
      removeCategoryMultiplier(categoryName);
      toast.success(`Category "${categoryName}" removed!`);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all multipliers to 1? This cannot be undone.')) {
      resetMultipliers();
      setLabourValue(1);
      setVendorValue(1);
      setEditingCategories({});
      toast.success('All multipliers reset to default!');
    }
  };

  const handleExport = () => {
    const data = exportMultipliers();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `multipliers-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Multipliers exported successfully!');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const success = importMultipliers(e.target.result);
        if (success) {
          setLabourValue(labourMultiplier);
          setVendorValue(vendorMultiplier);
          toast.success('Multipliers imported successfully!');
        } else {
          toast.error('Failed to import multipliers. Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
        <div className="flex items-center gap-3 mb-3">
          <Calculator className="text-blue-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold">Multiplier Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Set default multipliers for labour, vendors, and categories. These will apply throughout the entire project.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold">Labour Multiplier</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Labour Multiplier</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={labourValue}
                  onChange={(e) => setLabourValue(e.target.value)}
                  className="flex-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-lg font-semibold"
                  placeholder="1.0"
                />
                <Button onClick={handleSaveLabour} className="bg-blue-600 hover:bg-blue-700">
                  <Save size={18} />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Current value: <span className="font-bold text-blue-600">{labourMultiplier}x</span>
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <p className="text-sm font-medium mb-2">Example Calculation:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Cost: ₹500 × Multiplier: {labourValue} = <span className="font-bold text-blue-600">₹{(500 * labourValue).toFixed(2)}</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-green-600" size={24} />
            <h3 className="text-xl font-bold">Vendor Multiplier</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Vendor Multiplier</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={vendorValue}
                  onChange={(e) => setVendorValue(e.target.value)}
                  className="flex-1 p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-lg font-semibold"
                  placeholder="1.0"
                />
                <Button onClick={handleSaveVendor} className="bg-green-600 hover:bg-green-700">
                  <Save size={18} />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Current value: <span className="font-bold text-green-600">{vendorMultiplier}x</span>
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <p className="text-sm font-medium mb-2">Example Calculation:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Cost: ₹500 × Multiplier: {vendorValue} = <span className="font-bold text-green-600">₹{(500 * vendorValue).toFixed(2)}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Tag className="text-purple-600" size={24} />
            <h3 className="text-xl font-bold">Category-wise Multipliers</h3>
          </div>
        </div>

        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Plus size={18} />
            Add New Category Multiplier
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category Name (e.g., Body Work, Painting)"
              className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
            <input
              type="number"
              step="0.1"
              min="0"
              value={newCategoryMultiplier}
              onChange={(e) => setNewCategoryMultiplier(e.target.value)}
              placeholder="Multiplier"
              className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
            <Button onClick={handleAddCategory} className="bg-purple-600 hover:bg-purple-700">
              <Plus size={18} /> Add Category
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {Object.keys(categoryMultipliers).length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Tag size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No category multipliers set</p>
              <p className="text-sm">Add categories above to set specific multipliers</p>
            </div>
          ) : (
            Object.entries(categoryMultipliers).map(([categoryName, multiplierValue]) => (
              <div
                key={categoryName}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Tag className="text-purple-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium">{categoryName}</p>
                  <p className="text-sm text-gray-500">
                    Multiplier: <span className="font-bold text-purple-600">{multiplierValue}x</span>
                  </p>
                </div>

                {editingCategories[categoryName] ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      defaultValue={multiplierValue}
                      className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateCategory(categoryName, e.target.value);
                        }
                      }}
                      onBlur={(e) => handleUpdateCategory(categoryName, e.target.value)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategories({ ...editingCategories, [categoryName]: true })}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCategory(categoryName)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 bg-yellow-50 dark:bg-yellow-900">
        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-3">ℹ️ How Multipliers Work</h4>
        <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
          <li>• <strong>Labour Multiplier:</strong> Applied to all items where "Work By" is set to "Labour"</li>
          <li>• <strong>Vendor Multiplier:</strong> Applied to all items where "Work By" is set to "Vendor"</li>
          <li>• <strong>Category Multipliers:</strong> Applied based on the category of the item (overrides labour/vendor)</li>
          <li>• <strong>Formula:</strong> Final Cost = Base Cost × Quantity × Multiplier</li>
          <li>• <strong>Global Effect:</strong> These multipliers apply to estimates, challans, and invoices across the entire project</li>
        </ul>
      </Card>

      <div className="flex justify-between">
        <div className="flex gap-3">
          <Button onClick={handleExport} variant="outline">
            <Download size={18} /> Export
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-multipliers').click()}>
            <Upload size={18} /> Import
          </Button>
          <input
            id="import-multipliers"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
        <Button onClick={handleReset} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
          <RotateCcw size={18} /> Reset All to 1
        </Button>
      </div>
    </div>
  );
};

export default MultiplierSettingsTab;
