import TabbedPage from "../components/TabbedPage";
import VendorDetailsTab from "./vendors/VendorDetailsTab"
import VendorLedgerTab  from "./vendors/VendorLedgerTab";

const tabs = [
  {
    id: "VendorDetailsTab",
    label: "Vendor Details",
    component:VendorDetailsTab,
  },
  {
    id: "VendorLedgerTab",
    label: "Vendor Ledger",
    component: VendorLedgerTab,
  },
];

const Vendors = () => {
  return (
    <TabbedPage
      tabs={tabs}
      title="Vendor Management"
    />
  );
};

export default Vendors;
