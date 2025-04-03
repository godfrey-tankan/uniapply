// src/components/ui/select-field.tsx
import * as React from "react";
import clsx from "clsx";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface SelectFieldProps {
    placeholder?: string;
    options: { value: string; label: string }[];
    error?: string;
    className?: string;
}

const SelectField = React.forwardRef<
    React.ElementRef<typeof Select>,
    React.ComponentPropsWithoutRef<typeof Select> & SelectFieldProps
>(({ placeholder, options, error, className, ...props }, ref) => {
    return (
        <div className="space-y-1">
            <Select {...props}>
                <SelectTrigger
                    className={clsx(
                        "w-full",
                        error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-500",
                        className
                    )}
                >
                    <SelectValue placeholder={placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

SelectField.displayName = "SelectField";

export { SelectField };