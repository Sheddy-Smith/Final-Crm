import { useState, useEffect } from 'react';
import useCustomerStore from '@/store/customerStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchBar from '@/components/common/SearchBar';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

const CustomerForm = ({ customer, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
        customer || { name: '', phone: '', address: '', gstin: '', email: '', creditLimit: 0, openingBalance: 0, openingBalanceDate: new Date().toISOString().split('T')[0], notes: '' }
    );
    const [showAdvanced, setShowAdvanced] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!formData.name || !formData.phone){
            toast.error("Customer name and phone are required.");
            return;
        }
        onSave(formData);
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium dark:text-dark-text">Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" required />
            </div>
             <div>
                <label className="block text-sm font-medium dark:text-dark-text">Phone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" required />
            </div>
             <div>
                <label className="block text-sm font-medium dark:text-dark-text">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" />
            </div>
             <div>
                <label className="block text-sm font-medium dark:text-dark-text">GSTIN (Optional)</label>
                <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 dark:text-dark-text focus:ring-2 focus:ring-brand-red" />
            </div>

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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Positive = Customer owes, Negative = We owe</p>
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

             <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Customer</Button>
            </div>
        </form>
    )
}

const ContactsTab = () => {
    const { customers, loadCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [filteredCustomers, setFilteredCustomers] = useState(customers);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    useEffect(() => {
        setFilteredCustomers(customers);
    }, [customers]);

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredCustomers(customers);
            return;
        }
        const term = searchTerm.toLowerCase();
        const filtered = customers.filter(c =>
            c.name?.toLowerCase().includes(term) ||
            c.phone?.toLowerCase().includes(term) ||
            c.address?.toLowerCase().includes(term) ||
            c.gstin?.toLowerCase().includes(term)
        );
        setFilteredCustomers(filtered);
    };

    const handleReset = () => {
        setFilteredCustomers(customers);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const handleSave = async (customerData) => {
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, customerData);
                toast.success("Customer updated!");
            } else {
                await addCustomer(customerData);
                toast.success("Customer added!");
            }
            setIsModalOpen(false);
            setEditingCustomer(null);
        } catch (error) {
            toast.error("Failed to save customer: " + error.message);
        }
    };

    const handleDelete = (customer) => {
        setCustomerToDelete(customer);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        deleteCustomer(customerToDelete.id);
        toast.success(`Customer "${customerToDelete.name}" deleted.`);
        setIsDeleteModalOpen(false);
        setCustomerToDelete(null);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <SearchBar
                    onSearch={handleSearch}
                    onReset={handleReset}
                    searchFields={['name', 'phone', 'address', 'GSTIN']}
                />
                <Button onClick={handleAdd}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? "Edit Customer" : "Add New Customer"}>
                <CustomerForm customer={editingCustomer} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Customer"
                message={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone.`}
            />
            
             <div className="overflow-x-auto">
                <table className="w-full text-sm dark:text-dark-text-secondary">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left">
                        <tr>
                            <th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Address</th>
                            <th className="p-2">GSTIN</th><th className="p-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                            <tr key={c.id} className="border-b dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50">
                                <td className="p-2 font-medium dark:text-dark-text">{c.name}</td><td className="p-2">{c.phone}</td>
                                <td className="p-2">{c.address}</td><td className="p-2">{c.gstin}</td>
                                <td className="p-2 text-right space-x-1">
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEdit(c)}><Edit className="h-4 w-4 text-blue-600"/></Button>
                                     <Button variant="ghost" className="p-1 h-auto" onClick={() => handleDelete(c)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </td>
                            </tr>
                        )) : (
                           <tr><td colSpan="5" className="text-center p-8 text-gray-500 dark:text-dark-text-secondary">
                                <p>No customers found.</p>
                                <p className="text-xs mt-1">Click "Add Customer" to get started.</p>
                           </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default ContactsTab;
