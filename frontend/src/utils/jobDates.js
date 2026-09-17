const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export const formatJobDate = (value) => (value ? dateFormatter.format(new Date(value)) : 'Not specified');

export const getJobDuration = (job) => {
  if (!job.createdAt || !job.expiresAt) return 'No expiry date';
  const days = Math.max(0, Math.ceil((new Date(job.expiresAt) - new Date(job.createdAt)) / 86400000));
  return `${days} day${days === 1 ? '' : 's'} total`;
};

export const getRemainingJobTime = (expiresAt) => {
  if (!expiresAt) return 'No expiry date';
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 0) return 'Expired';
  const days = Math.floor(remaining / 86400000);
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} remaining`;
  const hours = Math.max(1, Math.floor(remaining / 3600000));
  return `${hours} hour${hours === 1 ? '' : 's'} remaining`;
};
