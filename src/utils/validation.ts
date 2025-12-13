/**
 * Utilidades de validación para formularios
 */

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

/**
 * Validar email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitizar HTML básico (prevenir XSS)
 */
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Validar longitud de texto
 */
export const isValidLength = (text: string, min: number, max: number): boolean => {
  const length = text.trim().length;
  return length >= min && length <= max;
};

/**
 * Validar teléfono (formato español/internacional)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validador genérico de formularios
 */
export class FormValidator {
  private rules: { [key: string]: ValidationRule[] } = {};
  private values: { [key: string]: any } = {};

  constructor(values: { [key: string]: any }) {
    this.values = values;
  }

  /**
   * Agregar regla de validación para un campo
   */
  addRule(field: string, rule: ValidationRule): this {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push(rule);
    return this;
  }

  /**
   * Validación de campo requerido
   */
  required(field: string, message = 'Este campo es obligatorio'): this {
    return this.addRule(field, {
      test: (value) => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return value != null && value !== '';
      },
      message,
    });
  }

  /**
   * Validación de email
   */
  email(field: string, message = 'El email no es válido'): this {
    return this.addRule(field, {
      test: (value) => !value || isValidEmail(value),
      message,
    });
  }

  /**
   * Validación de URL
   */
  url(field: string, message = 'La URL no es válida'): this {
    return this.addRule(field, {
      test: (value) => !value || isValidUrl(value),
      message,
    });
  }

  /**
   * Validación de longitud mínima
   */
  minLength(field: string, min: number, message?: string): this {
    return this.addRule(field, {
      test: (value) => !value || value.length >= min,
      message: message || `Debe tener al menos ${min} caracteres`,
    });
  }

  /**
   * Validación de longitud máxima
   */
  maxLength(field: string, max: number, message?: string): this {
    return this.addRule(field, {
      test: (value) => !value || value.length <= max,
      message: message || `No puede exceder ${max} caracteres`,
    });
  }

  /**
   * Validación de teléfono
   */
  phone(field: string, message = 'El teléfono no es válido'): this {
    return this.addRule(field, {
      test: (value) => !value || isValidPhone(value),
      message,
    });
  }

  /**
   * Validación personalizada
   */
  custom(field: string, test: (value: any) => boolean, message: string): this {
    return this.addRule(field, {
      test,
      message,
    });
  }

  /**
   * Ejecutar validación
   */
  validate(): ValidationResult {
    const errors: { [key: string]: string } = {};

    for (const field in this.rules) {
      const fieldRules = this.rules[field];
      const value = this.values[field];

      for (const rule of fieldRules) {
        if (!rule.test(value)) {
          errors[field] = rule.message;
          break; // Solo mostrar el primer error por campo
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validar un solo campo
   */
  validateField(field: string): string | null {
    const fieldRules = this.rules[field];
    if (!fieldRules) return null;

    const value = this.values[field];

    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }

    return null;
  }
}

/**
 * Helper para validar formularios rápidamente
 */
export const validate = (values: { [key: string]: any }): FormValidator => {
  return new FormValidator(values);
};
