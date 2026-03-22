import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import Input from './Input';
import type { ReactNode } from 'react';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
  autoComplete?: string;
}

export default function FormField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  icon,
  showPasswordToggle,
  autoComplete,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <Input
          {...field}
          label={label}
          type={type}
          placeholder={placeholder}
          error={error?.message}
          icon={icon}
          showPasswordToggle={showPasswordToggle}
          autoComplete={autoComplete}
        />
      )}
    />
  );
}
