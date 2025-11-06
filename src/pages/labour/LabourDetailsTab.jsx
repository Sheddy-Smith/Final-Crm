import { useState } from 'react';
import useLabourStore from '@/store/labourStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchBar from '@/components/common/SearchBar';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

const LabourForm = ({ labour, onSave, onCancel }) => {
    const [formData, setFormData] = useState(labour || { name: '', phone: '', rate: '', skill: 'Welder', address: '', email: '', creditLimit: 0, notes: '' });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.rate) return toast.error("Name and Rate are required.");
        onSave(formData);
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" required /></div>
            <div><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" /></div>
            <div><label>Skill/Trade</label><input type="text" name="skill" value={formData.skill} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" /></div>
            <div><label>Rate (₹ per day/hr)</label><input type="number" name="rate" value={formData.rate} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" required /></div>
            <div><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" /></div>

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
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" />
                    </div>
                    <div>
                        <label>Credit Limit (₹)</label>
                        <input type="number" name="creditLimit" value={formData.creditLimit} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" min="0" />
                        <p className="text-xs text-gray-500 mt-1">Maximum outstanding amount allowed</p>
                    </div>
                    <div>
                        <label>Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" rows="3"></textarea>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
    );
};

const LabourDetailsTab = () => {
    const { labours, addLabour, updateLabour, deleteLabour } = useLabourStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLabour, setEditingLabour] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [labourToDelete, setLabourToDelete] = useState(null);
    const [filteredLabours, setFilteredLabours] = useState(labours);

    const handleSearch = (term) => {
        if (!term.trim()) { setFilteredLabours(labours); return; }
        const filtered = labours.filter(l =>
            l.name?.toLowerCase().includes(term.toLowerCase()) ||
            l.phone?.toLowerCase().includes(term.toLowerCase()) ||
            l.skill?.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredLabours(filtered);
    };

    const handleReset = () => setFilteredLabours(labours);

    const handleEdit = (labour) => {
        setEditingLabour(labour);
        setIsModalOpen(true);
    };
    const handleAdd = () => {
        setEditingLabour(null);
        setIsModalOpen(true);
    };

    const handleSave = (data) => {
        if (editingLabour) {
            updateLabour({ ...editingLabour, ...data });
            toast.success("Labour details updated!");
        } else {
            addLabour(data);
            toast.success("Labour added!");
        }
        setIsModalOpen(false);
        setEditingLabour(null);
    };
    const handleDelete = (labour) => {
        setLabourToDelete(labour);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        deleteLabour(labourToDelete.id);
        toast.success("Labour record deleted.");
        setIsDeleteModalOpen(false);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <SearchBar onSearch={handleSearch} onReset={handleReset} searchFields={['name', 'phone', 'skill']} />
                <Button onClick={handleAdd}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Labour
                </Button>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLabour ? "Edit Labour Details" : "Add New Labour"}>
                <LabourForm labour={editingLabour} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Labour"
                message={`Are you sure you want to delete ${labourToDelete?.name}?`}
            />
            <div className="overflow-x-auto">
                <table className="w-full text-sm dark:text-dark-text-secondary">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left">
                        <tr><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Skill/Role</th><th className="p-2">Rate</th><th className="p-2 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {filteredLabours.length > 0 ? filteredLabours.map(l => (
                            <tr key={l.id} className="border-b dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50">
                                <td className="p-2 font-medium dark:text-dark-text">{l.name}</td><td className="p-2">{l.phone}</td><td className="p-2">{l.skill}</td><td className="p-2">{l.rate}</td>
                                <td className="p-2 text-right space-x-1">
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEdit(l)}><Edit className="h-4 w-4 text-blue-600"/></Button>
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleDelete(l)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="text-center p-8 text-gray-500 dark:text-dark-text-secondary">No labour records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default LabourDetailsTab;
