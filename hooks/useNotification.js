import { useToast } from '../components/Notification';

export const useNotification = () => {
  const { showToast } = useToast();

  const showSuccess = (message) => {
    showToast(message, 'success');
  };

  const showError = (message) => {
    showToast(message, 'error');
  };

  const showWarning = (message) => {
    showToast(message, 'warning');
  };

  return {
    showSuccess,
    showError,
    showWarning,
  };
};
