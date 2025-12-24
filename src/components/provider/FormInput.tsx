interface FormInputProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  maxLength?: number;
  pattern?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  error,
  helperText,
  className = '',
  maxLength,
  pattern,
  disabled = false,
  readOnly = false
}: FormInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm text-black">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern={pattern}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 border rounded-lg text-base text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-[#e5e7ea]'
        } ${disabled || readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        required={required}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#797e84]">{helperText}</p>
      )}
    </div>
  );
}

