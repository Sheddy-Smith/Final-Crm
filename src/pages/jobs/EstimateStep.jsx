


  // correct code 
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const EstimateStep = () => {
  // LocalStorage se inspection items load karo
  const [items] = useState(() => {
    const saved = localStorage.getItem("inspectionItems");
    return saved ? JSON.parse(saved) : [];
  });

  // LocalStorage se discount load karo
  const [discount, setDiscount] = useState(() => {
    const saved = localStorage.getItem("estimateDiscount");
    return saved ? parseFloat(saved) : 0;
  });

  // Default multipliers (agar manual multiplier na diya gaya ho)
  const defaultMultipliers = {
    Hardware: 2,
    Steel: 1.5,
    Labour: 2,
    Parts: 1.5,
  };

  // Har item ka total nikalne ka function (manual multiplier support ke sath)
  const calculateTotal = (item) => {
    const cost = parseFloat(item.cost) || 0;
    // manual multiplier (agar InspectionStep me user ne diya ho)
    const customMultiplier = parseFloat(item.multiplier) || null;
    const categoryMultiplier = defaultMultipliers[item.category?.trim()] || 1;
    const finalMultiplier = customMultiplier ?? categoryMultiplier; // agar custom hai to wahi lo
    return cost * finalMultiplier;
  };

  // Subtotal aur Discount ke baad total
  const subTotal = items.reduce((acc, item) => acc + calculateTotal(item), 0);
  const totalAfterDiscount = subTotal - (parseFloat(discount) || 0);

  // Jab discount change ho to localStorage me save karo
  useEffect(() => {
    localStorage.setItem("estimateDiscount", discount.toString());
  }, [discount]);

  // PDF Save karne ka function
  const handleSavePDF = () => {
    const input = document.getElementById("estimate-body");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("estimate.pdf");
    });
  };

  // Print karne ka function
  const handlePrint = () => {
    const printContent = document.getElementById("estimate-body");
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`<html><head><title>Estimate</title></head><body>${printContent.innerHTML}</body></html>`);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Estimate</h3>

      {/* Estimate Table + Summary */}
      <div id="estimate-body" className="overflow-x-auto border p-4 rounded">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Condition</th>
              <th className="p-2 border">Cost (₹)</th>
              <th className="p-2 border">Multiplier</th>
              <th className="p-2 border">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No inspection items.
                </td>
              </tr>
            )}
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2 border">{item.category}</td>
                <td className="p-2 border">{item.item}</td>
                <td className="p-2 border">{item.condition}</td>
                <td className="p-2 border">{item.cost}</td>
                <td className="p-2 border">
                  {item.multiplier || defaultMultipliers[item.category?.trim()] || 1}
                </td>
                <td className="p-2 border">{calculateTotal(item).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="mt-4 text-right">
          <div className="mb-2">Subtotal: ₹{subTotal.toFixed(2)}</div>
          <div className="mb-2">
            Discount:
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value)||0)}
              className="ml-2 w-20 p-1 border rounded"
            />
          </div>
          <div className="font-bold">Total: ₹{totalAfterDiscount.toFixed(2)}</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-2 mt-4 justify-end">
        <button onClick={handleSavePDF} className="bg-green-500 text-white px-4 py-2 rounded">
          Save PDF
        </button>
        <button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-2 rounded">
          Print
        </button>
      </div>
    </div>
  );
};

export default EstimateStep;
