import type { ComponentProps, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FieldProps = {
    label: string;
    error?: string;
    className?: string;
    children: ReactNode;
    htmlFor: string;
};

export function Field({
    label,
    error,
    className,
    children,
    htmlFor,
}: FieldProps) {
    return (
        <div className={cn('grid gap-1.5', className)}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

type TextFieldProps = ComponentProps<typeof Input> & {
    label: string;
    name: string;
    error?: string;
    wrapperClassName?: string;
};

export function TextField({
    label,
    name,
    error,
    wrapperClassName,
    id,
    ...props
}: TextFieldProps) {
    const fieldId = id ?? name;

    return (
        <Field
            label={label}
            error={error}
            htmlFor={fieldId}
            className={wrapperClassName}
        >
            <Input id={fieldId} name={name} {...props} />
        </Field>
    );
}

type SelectFieldProps = ComponentProps<'select'> & {
    label: string;
    name: string;
    error?: string;
    wrapperClassName?: string;
    options: { value: string | number; label: string }[];
};

export const selectClassName =
    'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30';

export function SelectField({
    label,
    name,
    error,
    wrapperClassName,
    options,
    id,
    className,
    ...props
}: SelectFieldProps) {
    const fieldId = id ?? name;

    return (
        <Field
            label={label}
            error={error}
            htmlFor={fieldId}
            className={wrapperClassName}
        >
            <select
                id={fieldId}
                name={name}
                className={cn(selectClassName, className)}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </Field>
    );
}
