'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:ring-offset-2',
          checked
            ? 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))]'
            : 'bg-[rgb(var(--muted))] border-[rgb(var(--border))]',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';