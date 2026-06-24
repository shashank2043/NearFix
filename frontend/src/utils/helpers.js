
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};


export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};


export const getStatusColor = (status) => {
  if (!status) return 'default';
  
  switch (status.toUpperCase()) {
    case 'REQUESTED':
      return 'warning';
    case 'ACCEPTED':
      return 'primary';
    case 'ON_THE_WAY':
      return 'info';
    case 'WORK_STARTED':
      return 'secondary';
    case 'WORK_COMPLETED':
    case 'PAID':
    case 'COMPLETED':
    case 'SUCCESS':
      return 'success';
    case 'CANCELLED':
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};
