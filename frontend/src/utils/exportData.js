// src/utils/exportData.js
export const exportToCSV = (trades, filename = 'trades.csv') => {
  if (!trades || trades.length === 0) {
    alert('No trades to export!');
    return;
  }

  // Headers
  const headers = ['Price', 'Quantity', 'Side', 'Timestamp'];
  
  // Rows
  const rows = trades.map(trade => [
    trade.price,
    trade.quantity,
    trade.buyerUserId === 'system' ? 'SELL' : 'BUY',
    new Date(trade.timestamp).toLocaleString()
  ]);

  // Combine
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (trades, filename = 'trades.json') => {
  if (!trades || trades.length === 0) {
    alert('No trades to export!');
    return;
  }

  const jsonContent = JSON.stringify(trades, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};