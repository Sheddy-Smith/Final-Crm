export const calculateJobStats = (jobs) => {
  const jobsArray = Object.values(jobs);

  const inProgress = jobsArray.filter(job =>
    ['Inspection', 'Estimate', 'JobSheet', 'Challan'].includes(job.status)
  ).length;

  const completed = jobsArray.filter(job => job.status === 'Invoice').length;

  const pendingApprovals = jobsArray.filter(job => job.estimate?.approvalNeeded).length;

  return { inProgress, completed, pendingApprovals, total: jobsArray.length };
};

export const calculateRevenue = (jobs) => {
  const jobsArray = Object.values(jobs);
  let totalRevenue = 0;

  jobsArray.forEach(job => {
    if (job.invoice?.items) {
      const subtotal = job.invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
      const discount = job.invoice.discountAmount || 0;
      const afterDiscount = subtotal - discount;
      const gst = afterDiscount * ((job.invoice.gstRate || 0) / 100);
      totalRevenue += afterDiscount + gst;
    }
  });

  return totalRevenue;
};

export const calculateExpenses = (jobs, labours, vendors, suppliers) => {
  let totalExpenses = 0;

  const jobsArray = Object.values(jobs);
  jobsArray.forEach(job => {
    if (job.inspection?.items) {
      job.inspection.items.forEach(item => {
        totalExpenses += parseFloat(item.cost || 0);
      });
    }
  });

  const laboursArray = Object.values(labours || []);
  laboursArray.forEach(labour => {
    if (labour.ledger) {
      labour.ledger.forEach(entry => {
        totalExpenses += parseFloat(entry.debit || 0);
      });
    }
  });

  const vendorsArray = Object.values(vendors || []);
  vendorsArray.forEach(vendor => {
    if (vendor.ledger) {
      vendor.ledger.forEach(entry => {
        totalExpenses += parseFloat(entry.debit || 0);
      });
    }
  });

  const suppliersArray = Object.values(suppliers || []);
  suppliersArray.forEach(supplier => {
    if (supplier.ledger) {
      supplier.ledger.forEach(entry => {
        totalExpenses += parseFloat(entry.debit || 0);
      });
    }
  });

  return totalExpenses;
};

export const calculateMonthlyRevenue = (jobs) => {
  const monthlyData = {};
  const jobsArray = Object.values(jobs);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(month => {
    monthlyData[month] = { revenue: 0, expenses: 0 };
  });

  jobsArray.forEach(job => {
    if (job.createdAt) {
      const date = new Date(job.createdAt);
      const month = months[date.getMonth()];

      if (job.invoice?.items) {
        const subtotal = job.invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
        const discount = job.invoice.discountAmount || 0;
        const afterDiscount = subtotal - discount;
        const gst = afterDiscount * ((job.invoice.gstRate || 0) / 100);
        monthlyData[month].revenue += afterDiscount + gst;
      }

      if (job.inspection?.items) {
        job.inspection.items.forEach(item => {
          monthlyData[month].expenses += parseFloat(item.cost || 0);
        });
      }
    }
  });

  return Object.entries(monthlyData).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    expenses: Math.round(data.expenses),
  }));
};

export const calculateExpenseBreakdown = (jobs, labours, vendors) => {
  let vendorExpenses = 0;
  let labourExpenses = 0;
  let stockExpenses = 0;

  const vendorsArray = Object.values(vendors || []);
  vendorsArray.forEach(vendor => {
    if (vendor.ledger) {
      vendor.ledger.forEach(entry => {
        vendorExpenses += parseFloat(entry.debit || 0);
      });
    }
  });

  const laboursArray = Object.values(labours || []);
  laboursArray.forEach(labour => {
    if (labour.ledger) {
      labour.ledger.forEach(entry => {
        labourExpenses += parseFloat(entry.debit || 0);
      });
    }
  });

  const jobsArray = Object.values(jobs);
  jobsArray.forEach(job => {
    if (job.inspection?.items) {
      job.inspection.items.forEach(item => {
        if (item.category === 'Parts' || item.category === 'Hardware' || item.category === 'Steel') {
          stockExpenses += parseFloat(item.cost || 0);
        }
      });
    }
  });

  return [
    { name: 'Vendor', value: Math.round(vendorExpenses) },
    { name: 'Labour', value: Math.round(labourExpenses) },
    { name: 'Stock', value: Math.round(stockExpenses) },
  ];
};

export const calculateProfitLoss = (jobs) => {
  const monthlyData = {};
  const jobsArray = Object.values(jobs);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months.forEach(month => {
    monthlyData[month] = { revenue: 0, expenses: 0 };
  });

  jobsArray.forEach(job => {
    if (job.createdAt) {
      const date = new Date(job.createdAt);
      const month = months[date.getMonth()];

      if (job.invoice?.items) {
        const subtotal = job.invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
        const discount = job.invoice.discountAmount || 0;
        const afterDiscount = subtotal - discount;
        const gst = afterDiscount * ((job.invoice.gstRate || 0) / 100);
        monthlyData[month].revenue += afterDiscount + gst;
      }

      if (job.inspection?.items) {
        job.inspection.items.forEach(item => {
          monthlyData[month].expenses += parseFloat(item.cost || 0);
        });
      }
    }
  });

  return Object.entries(monthlyData).map(([name, data]) => ({
    name,
    profit: Math.round(data.revenue - data.expenses),
  }));
};

export const calculateStockValue = (stockItems) => {
  let totalValue = 0;

  stockItems.forEach(item => {
    const quantity = parseFloat(item.quantity || 0);
    const price = parseFloat(item.price || 0);
    totalValue += quantity * price;
  });

  return totalValue;
};

export const calculateTotalPartsUsed = (jobs) => {
  let totalParts = 0;
  const jobsArray = Object.values(jobs);

  jobsArray.forEach(job => {
    if (job.inspection?.items) {
      totalParts += job.inspection.items.filter(item => item.category === 'Parts').length;
    }
  });

  return totalParts;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
