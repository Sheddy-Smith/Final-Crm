import TabbedPage from '@/components/TabbedPage';
import LeadsTab from './customer/LeadsTab';
import ContactsTab from './customer/ContactsTab';
import LedgerTab from './customer/LedgerTab';

const tabs = [
  { id: 'contacts', label: 'Contacts', component: ContactsTab },
  { id: 'leads', label: 'Leads', component: LeadsTab },
  { id: 'ledger', label: 'Customer Ledger', component: LedgerTab },
];

const Customer = () => {
    return (
        <TabbedPage tabs={tabs} title="Customer Management" />
    );
};
export default Customer;