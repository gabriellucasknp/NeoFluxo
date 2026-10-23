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
          {label} {required && <span className="text-danger-fg">*</span>}
        </label>
      )}
      <input className={`input-base ${error ? 'border-danger ring-danger/30' : ''} ${className}`} {...rest} />
      {error && <p className="mt-1 text-xs text-danger-fg">{error}</p>}
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
          {label} {required && <span className="text-danger-fg">*</span>}
        </label>
      )}
      <textarea className={`input-base ${error ? 'border-danger' : ''} ${className}`} {...rest} />
      {error && <p className="mt-1 text-xs text-danger-fg">{error}</p>}
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
          {label} {required && <span className="text-danger-fg">*</span>}
        </label>
      )}
      <select className={`input-base ${error ? 'border-danger' : ''} ${className}`} {...rest}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger-fg">{error}</p>}
    </div>
  );
}
