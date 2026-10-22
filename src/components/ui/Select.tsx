'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx(
          'w-full rounded-xl border bg-[rgb(var(--background))] px-4 py-2.5 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat bg-right-3 bg-center pr-10',
          'border-[rgb(var(--input))]',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export const SelectTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string; placeholder?: string }>(
  ({ className, value, placeholder, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={clsx(
          'w-full flex items-center justify-between rounded-xl border bg-[rgb(var(--background))] px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200',
          'border-[rgb(var(--input))] hover:border-[rgb(var(--muted-foreground))/0.5]',
          value ? 'text-[rgb(var(--foreground))]' : 'text-[rgb(var(--muted-foreground))]',
          className
        )}
        {...props}
      >
        <span>{value || placeholder || children}</span>
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'absolute z-50 mt-1 w-full max-h-96 overflow-y-auto rounded-xl border bg-[rgb(var(--card))] shadow-lg',
          'border-[rgb(var(--border))]',
          className
        )}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

export const SelectItem = forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement> & { value: string; disabled?: boolean }>(
  ({ className, value, children, disabled, ...props }, ref) => {
    return (
      <li
        ref={ref}
        role="option"
        aria-selected="false"
        aria-disabled={disabled}
        data-value={value}
        className={clsx(
          'relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors',
          'hover:bg-[rgb(var(--muted))] focus:bg-[rgb(var(--muted))]',
          disabled ? 'opacity-50 pointer-events-none' : '',
          className
        )}
        {...props}
      >
        <span className="text-[rgb(var(--foreground))]">{children}</span>
      </li>
    );
  }
);
SelectItem.displayName = 'SelectItem';