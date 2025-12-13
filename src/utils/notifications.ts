import { toast } from 'sonner@2.0.3';

/**
 * Sistema centralizado de notificaciones
 * Reemplaza los alert() con notificaciones toast elegantes
 */

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4500,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
};

/**
 * Manejo de errores de API con notificaciones
 */
export const handleApiError = (error: any, context?: string) => {
  const message = error?.message || 'Ha ocurrido un error';
  const description = context ? `Error en: ${context}` : undefined;
  
  // Log para desarrollo (se eliminará en producción)
  if (import.meta.env.DEV) {
    console.error(`[API Error]${context ? ` ${context}:` : ''}`, error);
  }
  
  notify.error(message, description);
};

/**
 * Validación de campos con notificación
 */
export const validateAndNotify = (
  isValid: boolean,
  errorMessage: string,
  field?: string
): boolean => {
  if (!isValid) {
    notify.error(errorMessage, field ? `Campo: ${field}` : undefined);
  }
  return isValid;
};
