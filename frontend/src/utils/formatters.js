export const formatCurrency = (value) => {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  const colors = { new: '#3b82f6', contacted: '#f59e0b', closed: '#10b981' };
  return colors[status] || '#6b7280';
};

export const getPriorityColor = (priority) => {
  const colors = { low: '#6b7280', medium: '#f59e0b', high: '#ef4444' };
  return colors[priority] || '#6b7280';
};