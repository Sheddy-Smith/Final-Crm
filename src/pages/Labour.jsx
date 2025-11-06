import TabbedPage from "../components/TabbedPage";
import LabourDetailsTab from "./labour/LabourDetailsTab"
import LabourLedgerTab from "./labour/LabourLedgerTab";

const tabs = [
  {
    id: "LabourDetailsTab",
    label: "Labour Details",
    component:LabourDetailsTab,
  },
  {
    id: "LabourLedgerTab",
    label: "Labour Ledger",
    component:LabourLedgerTab,
  },
];

const Labour = () => {
  return (
    <TabbedPage
      tabs={tabs}
      title="Labour Management"
    />
  );
};

export default Labour;
