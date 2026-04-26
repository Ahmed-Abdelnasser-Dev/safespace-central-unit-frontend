import toast from 'react-hot-toast';

const baseStyle = {
  background: '#1e293b',
  color: '#fff',
  border: '1px solid #334155',
};

export const showSuccess = (message) =>
  toast.success(message, {
    style: baseStyle,
    iconTheme: { primary: '#10b981', secondary: '#fff' },
  });

export const showError = (message) =>
  toast.error(message, {
    style: baseStyle,
    iconTheme: { primary: '#ef4444', secondary: '#fff' },
  });

export const showInfo = (message) =>
  toast(message, {
    icon: 'ℹ️',
    style: baseStyle,
  });
