import { useState } from 'react';
import useSupplierStore from '@/store/supplierStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchBar from '@/components/common/SearchBar';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

const SupplierForm = ({ supplier, onSave, onCancel }) => {
    const [formData, setFormData] = useState(supplier || { name: '', phone: '', category: 'Hardware', address: '', gstin: '', email: '', creditLimit: 0, openingBalance: 0, openingBalanceDate: new Date().toISOString().split('T')[0], notes: '' });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error("Supplier name is required.");
        onSave(formData);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" required /></div>
            <div><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" /></div>
            <div><label>Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red"><option>Hardware</option><option>Steel</option><option>Paints</option><option>Parts</option></select></div>
            <div><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" /></div>
            <div><label>GSTIN</label><input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" /></div>

            <div className="border-t pt-4 dark:border-gray-600">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-brand-red hover:text-red-700 font-medium flex items-center gap-2"
                >
                    {showAdvanced ? '▼' : '▶'} Advanced Options
                </button>
            </div>

            {showAdvanced && (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium dark:text-dark-text">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-dark-text">Opening Balance (₹)</label>
                            <input type="number" name="openingBalance" value={formData.openingBalance} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" step="0.01" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Positive = They owe, Negative = We owe</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-dark-text">Opening Balance Date</label>
                            <input type="date" name="openingBalanceDate" value={formData.openingBalanceDate} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-dark-text">Credit Limit (₹)</label>
                        <input type="number" name="creditLimit" value={formData.creditLimit} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" min="0" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum outstanding amount allowed</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-dark-text">Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" rows="3"></textarea>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
    );
};

const SupplierDetailsTab = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [filteredSuppliers, setFilteredSuppliers] = useState(suppliers);

    const handleSearch = (term) => {
        if (!term.trim()) { setFilteredSuppliers(suppliers); return; }
        const filtered = suppliers.filter(s =>
            s.name?.toLowerCase().includes(term.toLowerCase()) ||
            s.phone?.toLowerCase().includes(term.toLowerCase()) ||
            s.category?.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredSuppliers(filtered);
    };

    const handleReset = () => setFilteredSuppliers(suppliers);

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };
    const handleAdd = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleSave = (data) => {
        if (editingSupplier) {
            updateSupplier({ ...editingSupplier, ...data });
            toast.success("Supplier updated!");
        } else {
            addSupplier(data);
            toast.success("Supplier added!");
        }
        setIsModalOpen(false);
        setEditingSupplier(null);
    };
    const handleDelete = (supplier) => {
        setSupplierToDelete(supplier);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        deleteSupplier(supplierToDelete.id);
        toast.success("Supplier deleted.");
        setIsDeleteModalOpen(false);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <SearchBar onSearch={handleSearch} onReset={handleReset} searchFields={['name', 'phone', 'category']} />
                <Button onClick={handleAdd}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Supplier
                </Button>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}>
                <SupplierForm supplier={editingSupplier} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Supplier"
                message={`Are you sure you want to delete ${supplierToDelete?.name}?`}
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm dark:text-dark-text-secondary">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left">
                        <tr><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Category</th><th className="p-2 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
                            <tr key={s.id} className="border-b dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50">
                                <td className="p-2 font-medium dark:text-dark-text">{s.name}</td><td className="p-2">{s.phone}</td><td className="p-2">{s.category}</td>
                                <td className="p-2 text-right space-x-1">
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEdit(s)}><Edit className="h-4 w-4 text-blue-600"/></Button>
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleDelete(s)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center p-8 text-gray-500 dark:text-dark-text-secondary">No suppliers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default SupplierDetailsTab;
