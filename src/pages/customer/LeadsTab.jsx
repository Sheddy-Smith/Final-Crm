import { useState } from 'react';
import useCustomerStore from '@/store/customerStore';
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { PlusCircle, Edit, Trash2, UserPlus } from "lucide-react";
import { toast } from 'sonner';

const LeadForm = ({ lead, onSave, onCancel }) => {
    const [formData, setFormData] = useState(lead || {
        name: '',
        phone: '',
        enquiryFor: '',
        source: '',
        email: '',
        address: '',
        creditLimit: 0,
        notes: ''
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error('Name and Phone are required');
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" required />
            </div>
            <div>
                <label>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" required />
            </div>
            <div>
                <label>Enquiry For</label>
                <input type="text" name="enquiryFor" value={formData.enquiryFor} onChange={handleChange}
                    placeholder="e.g., Denting & Painting"
                    className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" />
            </div>
            <div>
                <label>Source</label>
                <select name="source" value={formData.source} onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red">
                    <option value="">Select Source</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Referral">Referral</option>
                    <option value="Phone">Phone Call</option>
                    <option value="Website">Website</option>
                    <option value="Social Media">Social Media</option>
                </select>
            </div>

            <div className="border-t pt-4 dark:border-gray-600">
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-brand-red hover:text-red-700 font-medium flex items-center gap-2">
                    {showAdvanced ? '▼' : '▶'} Advanced Options
                </button>
            </div>

            {showAdvanced && (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" />
                    </div>
                    <div>
                        <label>Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" />
                    </div>
                    <div>
                        <label>Credit Limit (₹)</label>
                        <input type="number" name="creditLimit" value={formData.creditLimit} onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" min="0" />
                        <p className="text-xs text-gray-500 mt-1">Set for future conversion to customer</p>
                    </div>
                    <div>
                        <label>Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg bg-transparent dark:border-gray-600 focus:ring-2 focus:ring-brand-red" rows="3"></textarea>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Lead</Button>
            </div>
        </form>
    );
};

const LeadsTab = () => {
    const { addCustomer } = useCustomerStore();
    const [leads, setLeads] = useState(() => {
        const saved = localStorage.getItem('leads');
        return saved ? JSON.parse(saved) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);

    const saveLead = (leadData) => {
        let updatedLeads;
        if (editingLead) {
            updatedLeads = leads.map(l => l.id === editingLead.id ? { ...editingLead, ...leadData } : l);
            toast.success('Lead updated');
        } else {
            const newLead = { ...leadData, id: Date.now().toString(), date: new Date().toISOString().split('T')[0], status: 'new' };
            updatedLeads = [...leads, newLead];
            toast.success('Lead added');
        }
        setLeads(updatedLeads);
        localStorage.setItem('leads', JSON.stringify(updatedLeads));
        setIsModalOpen(false);
        setEditingLead(null);
    };

    const handleEdit = (lead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleDelete = (leadId) => {
        const updatedLeads = leads.filter(l => l.id !== leadId);
        setLeads(updatedLeads);
        localStorage.setItem('leads', JSON.stringify(updatedLeads));
        toast.success('Lead deleted');
    };

    const convertToCustomer = (lead) => {
        addCustomer({
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            address: lead.address || '',
            creditLimit: lead.creditLimit || 0,
            notes: lead.notes || `Converted from lead. Original enquiry: ${lead.enquiryFor || 'N/A'}`
        });
        handleDelete(lead.id);
        toast.success(`${lead.name} converted to customer!`);
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold dark:text-dark-text">Leads Management</h3>
                <Button onClick={() => { setEditingLead(null); setIsModalOpen(true); }}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Lead
                </Button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLead ? 'Edit Lead' : 'Add New Lead'}>
                <LeadForm lead={editingLead} onSave={saveLead} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            <div className="overflow-x-auto">
                <table className="w-full text-sm dark:text-dark-text-secondary">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left">
                        <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Phone</th>
                            <th className="p-2">Enquiry For</th>
                            <th className="p-2">Source</th>
                            <th className="p-2">Date</th>
                            <th className="p-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length > 0 ? leads.map(lead => (
                            <tr key={lead.id} className="border-b dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-800/50">
                                <td className="p-2 font-medium dark:text-dark-text">{lead.name}</td>
                                <td className="p-2">{lead.phone}</td>
                                <td className="p-2">{lead.enquiryFor || '-'}</td>
                                <td className="p-2">{lead.source || '-'}</td>
                                <td className="p-2">{lead.date}</td>
                                <td className="p-2 text-right space-x-1">
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => convertToCustomer(lead)}
                                        title="Convert to Customer">
                                        <UserPlus className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleEdit(lead)}>
                                        <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button variant="ghost" className="p-1 h-auto" onClick={() => handleDelete(lead.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center p-8 text-gray-500 dark:text-dark-text-secondary">
                                    No leads yet. Click "Add Lead" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default LeadsTab;
