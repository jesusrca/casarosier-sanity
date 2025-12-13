import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
  rows?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  helpText,
  className = '',
  rows = 3,
  icon,
  disabled = false,
}: FormFieldProps) {
  const baseInputClasses = `
    w-full px-4 py-2 
    border rounded-lg
    transition-all
    focus:outline-none focus:ring-2
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-foreground/20 focus:ring-primary focus:border-primary'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${icon ? 'pl-10' : ''}
  `.trim().replace(/\s+/g, ' ');

  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      value,
      onChange: (e: any) => onChange(e.target.value),
      placeholder,
      required,
      disabled,
      className: baseInputClasses + ' ' + className,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${name}-error` : helpText ? `${name}-help` : undefined,
    };

    if (type === 'textarea') {
      return <textarea {...commonProps} rows={rows} />;
    }

    return <input {...commonProps} type={type} />;
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40">
            {icon}
          </div>
        )}
        {renderInput()}
      </div>
      
      {error && (
        <div 
          id={`${name}-error`} 
          className="flex items-start gap-2 text-sm text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {!error && helpText && (
        <p id={`${name}-help`} className="text-xs text-foreground/60">
          {helpText}
        </p>
      )}
    </div>
  );
}
