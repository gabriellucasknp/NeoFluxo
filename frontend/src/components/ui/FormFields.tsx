import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Input({ label, error, required, className = '', ...rest }: InputProps) {
  return (
    <div>
      {label && (
        <label className="label-base">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <input className={`input-base ${error ? 'border-danger-500 ring-danger-100' : ''} ${className}`} {...rest} />
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Textarea({ label, error, required, className = '', ...rest }: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="label-base">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <textarea className={`input-base ${error ? 'border-danger-500' : ''} ${className}`} {...rest} />
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Select({ label, error, required, className = '', children, ...rest }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="label-base">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <select className={`input-base ${error ? 'border-danger-500' : ''} ${className}`} {...rest}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}
