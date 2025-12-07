/**
 * Form validation utilities with common validators
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface FieldValidation {
  validate: (value: string) => ValidationResult;
}

// ============================================
// Basic Validators
// ============================================

export const validators = {
  /**
   * Check if value is not empty
   */
  required: (message = 'This field is required'): FieldValidation => ({
    validate: (value: string) => ({
      isValid: value.trim().length > 0,
      error: value.trim().length > 0 ? null : message,
    }),
  }),

  /**
   * Check minimum length
   */
  minLength: (min: number, message?: string): FieldValidation => ({
    validate: (value: string) => ({
      isValid: value.length >= min,
      error: value.length >= min ? null : message || `Must be at least ${min} characters`,
    }),
  }),

  /**
   * Check maximum length
   */
  maxLength: (max: number, message?: string): FieldValidation => ({
    validate: (value: string) => ({
      isValid: value.length <= max,
      error: value.length <= max ? null : message || `Must be no more than ${max} characters`,
    }),
  }),

  /**
   * Validate email format
   */
  email: (message = 'Please enter a valid email address'): FieldValidation => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(value);
      return { isValid, error: isValid ? null : message };
    },
  }),

  /**
   * Validate password strength
   */
  password: (options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  }): FieldValidation => ({
    validate: (value: string) => {
      const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumber = true,
        requireSpecial = false,
      } = options || {};

      const errors: string[] = [];

      if (value.length < minLength) {
        errors.push(`at least ${minLength} characters`);
      }
      if (requireUppercase && !/[A-Z]/.test(value)) {
        errors.push('one uppercase letter');
      }
      if (requireLowercase && !/[a-z]/.test(value)) {
        errors.push('one lowercase letter');
      }
      if (requireNumber && !/\d/.test(value)) {
        errors.push('one number');
      }
      if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        errors.push('one special character');
      }

      const isValid = errors.length === 0;
      return {
        isValid,
        error: isValid ? null : `Password must contain ${errors.join(', ')}`,
      };
    },
  }),

  /**
   * Match another field value
   */
  matches: (getValue: () => string, message = 'Fields do not match'): FieldValidation => ({
    validate: (value: string) => {
      const isValid = value === getValue();
      return { isValid, error: isValid ? null : message };
    },
  }),

  /**
   * Custom regex pattern
   */
  pattern: (regex: RegExp, message = 'Invalid format'): FieldValidation => ({
    validate: (value: string) => {
      const isValid = regex.test(value);
      return { isValid, error: isValid ? null : message };
    },
  }),

  /**
   * Validate URL format
   */
  url: (message = 'Please enter a valid URL'): FieldValidation => ({
    validate: (value: string) => {
      try {
        new URL(value);
        return { isValid: true, error: null };
      } catch {
        return { isValid: false, error: message };
      }
    },
  }),

  /**
   * Validate phone number (basic)
   */
  phone: (message = 'Please enter a valid phone number'): FieldValidation => ({
    validate: (value: string) => {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      const cleaned = value.replace(/\s/g, '');
      const isValid = phoneRegex.test(cleaned) && cleaned.length >= 10;
      return { isValid, error: isValid ? null : message };
    },
  }),
};

// ============================================
// Compose Multiple Validators
// ============================================

/**
 * Compose multiple validators into one
 * Stops on first error
 */
export function composeValidators(...validations: FieldValidation[]): FieldValidation {
  return {
    validate: (value: string) => {
      for (const validation of validations) {
        const result = validation.validate(value);
        if (!result.isValid) {
          return result;
        }
      }
      return { isValid: true, error: null };
    },
  };
}

// ============================================
// Form Validation Helper
// ============================================

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormValues {
  [key: string]: string;
}

export interface FormValidationSchema {
  [key: string]: FieldValidation;
}

/**
 * Validate entire form
 */
export function validateForm(
  values: FormValues,
  schema: FormValidationSchema
): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};
  let isValid = true;

  for (const [field, validation] of Object.entries(schema)) {
    const value = values[field] || '';
    const result = validation.validate(value);
    errors[field] = result.error;
    if (!result.isValid) {
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validate single field
 */
export function validateField(
  value: string,
  validation: FieldValidation
): ValidationResult {
  return validation.validate(value);
}

// ============================================
// Pre-built Validation Schemas
// ============================================

export const commonSchemas = {
  login: {
    email: composeValidators(
      validators.required('Email is required'),
      validators.email()
    ),
    password: validators.required('Password is required'),
  },

  register: {
    email: composeValidators(
      validators.required('Email is required'),
      validators.email()
    ),
    password: composeValidators(
      validators.required('Password is required'),
      validators.password()
    ),
    displayName: composeValidators(
      validators.required('Name is required'),
      validators.minLength(2, 'Name must be at least 2 characters')
    ),
  },

  resetPassword: {
    email: composeValidators(
      validators.required('Email is required'),
      validators.email()
    ),
  },
};
