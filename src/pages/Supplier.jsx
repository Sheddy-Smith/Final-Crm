import { useState } from 'react';
import TabbedPage from '@/components/TabbedPage';
import SupplierDetailsTab from './supplier/SupplierDetailsTab';
import useSupplierStore from '@/store/supplierStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import SupplierLedger from './supplier/SupplierLedger';

const SupplierForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', category: 'Hardware' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error("Supplier name is required.");
        onSave(formData);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Name</label><input type="text" name="name" onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" required /></div>
            <div><label>Phone</label><input type="text" name="phone" onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" /></div>
            <div><label>Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red"><option>Hardware</option><option>Steel</option><option>Paints</option><option>Parts</option></select></div>
            <div className="flex justify-end space-x-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
    );
};

const Placeholder = ({ title }) => <div className="dark:text-dark-text"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-gray-600 dark:text-dark-text-secondary">Content for {title} will go here.</p></div>;

const tabs = [
    { id: 'details', label: 'Supplier Details', component: SupplierDetailsTab },
    { id: 'ledger', label: 'Supplier Ledger', component: SupplierLedger  },
];

const Supplier = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addSupplier } = useSupplierStore();
    const handleSave = (data) => {
        addSupplier(data);
        toast.success("New supplier added!");
        setIsModalOpen(false);
    };
    const headerActions = (<Button onClick={() => setIsModalOpen(true)}><PlusCircle className="h-4 w-4 mr-2" />Add Supplier</Button>);

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Supplier">
                <SupplierForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            <TabbedPage tabs={tabs} title="Supplier Management" headerActions={headerActions} />
        </>
    );
};
export default Supplier;
