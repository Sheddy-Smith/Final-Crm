import TabbedPage from '@/components/TabbedPage';
import SupplierDetailsTab from './supplier/SupplierDetailsTab';
import SupplierLedger from './supplier/SupplierLedger';

const tabs = [
    { id: 'details', label: 'Supplier Details', component: SupplierDetailsTab },
    { id: 'ledger', label: 'Supplier Ledger', component: SupplierLedger  },
];

const Supplier = () => {
    return (
        <TabbedPage tabs={tabs} title="Supplier Management" />
    );
};
export default Supplier;
