import TabbedPage from '@/components/TabbedPage';
import UserManagementTab from './settings/UserManagementTab';
import GeneralSettingsTab from './settings/GeneralSettingsTab';
import LedgerSettingsTab from './settings/LedgerSettingsTab';
import InventorySettingsTab from './settings/InventorySettingsTab';
import InvoiceSettingsTab from './settings/InvoiceSettingsTab';
import BackupSettingsTab from './settings/BackupSettingsTab';
import SecuritySettingsTab from './settings/SecuritySettingsTab';
import MultiplierSettingsTab from './settings/MultiplierSettingsTab';
import CompanyMasterTab from './settings/CompanyMasterTab';
import AboutTab from './settings/AboutTab';
import { Settings as SettingsIcon, Users, Calculator, Package, FileText, Database, Printer, Shield, Info, Cloud, Wrench, Percent, Building } from 'lucide-react';

const Placeholder = ({ title, icon: Icon }) => (
  <div className="dark:text-dark-text text-center py-12">
    {Icon && <Icon size={48} className="mx-auto mb-4 text-gray-400" />}
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="mt-2 text-gray-600 dark:text-dark-text-secondary">
      {title} settings will be available in the next update.
    </p>
  </div>
);

const tabs = [
  {
    id: 'company',
    label: 'Company Master',
    icon: Building,
    component: CompanyMasterTab
  },
  {
    id: 'general',
    label: 'General',
    icon: SettingsIcon,
    component: GeneralSettingsTab
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    component: UserManagementTab
  },
  {
    id: 'multiplier',
    label: 'Multiplier Settings',
    icon: Percent,
    component: MultiplierSettingsTab
  },
  {
    id: 'ledger',
    label: 'Ledger & Accounting',
    icon: Calculator,
    component: LedgerSettingsTab
  },
  {
    id: 'inventory',
    label: 'Inventory & Stock',
    icon: Package,
    component: InventorySettingsTab
  },
  {
    id: 'invoice',
    label: 'Invoice & Billing',
    icon: FileText,
    component: InvoiceSettingsTab
  },
  {
    id: 'backup',
    label: 'Data & Backup',
    icon: Database,
    component: BackupSettingsTab
  },
  {
    id: 'sync',
    label: 'Sync & Integration',
    icon: Cloud,
    component: () => <Placeholder title="Sync & Integration" icon={Cloud} />
  },
  {
    id: 'print',
    label: 'Print & Export',
    icon: Printer,
    component: () => <Placeholder title="Print & Export" icon={Printer} />
  },
  {
    id: 'maintenance',
    label: 'System Maintenance',
    icon: Wrench,
    component: () => <Placeholder title="System Maintenance" icon={Wrench} />
  },
  {
    id: 'security',
    label: 'Security & Privacy',
    icon: Shield,
    component: SecuritySettingsTab
  },
  {
    id: 'about',
    label: 'About & License',
    icon: Info,
    component: AboutTab
  },
];

const Settings = () => {
  return (
    <TabbedPage tabs={tabs} title="⚙️ Settings & Configuration" />
  );
};

export default Settings;
