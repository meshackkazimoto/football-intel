import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    if (isToday(d)) {
      return 'Today';
    }
    if (isTomorrow(d)) {
      return 'Tomorrow';
    }
    if (isYesterday(d)) {
      return 'Yesterday';
    }
    
    return format(d, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return format(d, 'HH:mm');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return format(d, 'MMM dd, yyyy • HH:mm');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch (error) {
    return 'Invalid Date';
  }
};
