export const formatPrice = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rp0';
  return 'Rp' + num.toLocaleString('id-ID');
};

export const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-';
  // ganti spasi dengan T agar bisa di-parse
  const isoStr = dateStr.replace(' ', 'T');
  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? '-' : d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

