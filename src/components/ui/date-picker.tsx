"use client";

import { Calendar } from "lucide-react";
import { Input } from "./input";

interface DatePickerProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

export function DatePicker({
  name,
  value,
  onChange,
  min,
  max,
  required,
}: DatePickerProps) {
  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      <Input
        type="date"
        name={name}
        value={value}
        min={min}
        max={max}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.preventDefault()} // Disables manual typing
        onClick={(e) => {
          try {
            if ("showPicker" in e.currentTarget) {
              e.currentTarget.showPicker();
            }
          } catch (err) {
            // Ignore error if showPicker fails
          }
        }}
        className={`bg-gray-50 border-gray-200 pl-10 h-11 rounded-lg focus:border-blue-500 focus:ring-blue-500/20 w-full cursor-pointer relative ${
          !value ? "text-transparent" : "text-gray-900"
        } 
        /* Stretches the native calendar icon over the entire input so clicking anywhere opens it */
        [&::-webkit-calendar-picker-indicator]:opacity-0 
        [&::-webkit-calendar-picker-indicator]:absolute 
        [&::-webkit-calendar-picker-indicator]:inset-0 
        [&::-webkit-calendar-picker-indicator]:w-full 
        [&::-webkit-calendar-picker-indicator]:h-full 
        [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
      />
      
      {/* Custom placeholder when no date is selected */}
      {!value && (
        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
          Select date
        </span>
      )}
    </div>
  );
}
