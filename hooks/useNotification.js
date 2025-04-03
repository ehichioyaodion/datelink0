import { useToast } from 'react-native-toast-notifications';

export const useNotification = () => {
  const toast = useToast();

  const showSuccess = (message) => {
    toast.show(message, {
      type: 'success',
      placement: 'top',
      duration: 4000,
      offset: 30,
      animationType: 'slide-in',
    });
  };

  const showError = (message) => {
    toast.show(message, {
      type: 'danger',
      placement: 'top',
      duration: 4000,
      offset: 30,
      animationType: 'slide-in',
    });
  };

  return {
    showSuccess,
    showError,
  };
};