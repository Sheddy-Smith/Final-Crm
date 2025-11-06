// A simple number-to-words utility for Indian numbering system.
// This is a basic implementation for demonstration.
const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

function convertLessThanThousand(n) {
  if (n === 0) return '';
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
  return ones[Math.floor(n / 100)] + ' hundred ' + convertLessThanThousand(n % 100);
}

export function amountInWords(num) {
  if (num === 0) return 'zero';
  let inWords = '';
  if (num >= 10000000) {
    inWords += convertLessThanThousand(Math.floor(num / 10000000)) + ' crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    inWords += convertLessThanThousand(Math.floor(num / 100000)) + ' lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    inWords += convertLessThanThousand(Math.floor(num / 1000)) + ' thousand ';
    num %= 1000;
  }
  if (num > 0) {
    inWords += convertLessThanThousand(num);
  }
  return inWords.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export const calculateWithMultiplier = (baseAmount, quantity, category, workBy, multiplierStore) => {
  const amount = baseAmount * quantity;

  let multiplier = 1;
  if (category && multiplierStore) {
    multiplier = multiplierStore.getCategoryMultiplier(category);
  } else if (workBy && multiplierStore) {
    multiplier = multiplierStore.getMultiplierByWorkType(workBy);
  }

  return {
    baseAmount: amount,
    multiplier,
    finalAmount: amount * multiplier,
  };
};

export const calculateGST = (amount, gstRate = 18) => {
  const gstAmount = (amount * gstRate) / 100;
  return {
    taxableAmount: amount,
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    totalGST: gstAmount,
    totalAmount: amount + gstAmount,
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};
