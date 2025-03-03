import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

export const Button = ({
  onClick,
  disabled,
  variant = 'default',
  children,
  bg,
  text,
}: {
  success?: boolean;
  fail?: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'success' | 'error' | 'default';
  bg: string;
  text: string;
} & PropsWithChildren) => {
  return (
    <button
      style={{
        backgroundColor: variant == 'default' ? bg : '',
        color: variant == 'default' ? text : '',
      }}
      className={clsx(
        'flex w-full max-w-full items-center justify-center text-nowrap rounded-button px-4 py-3 text-text font-semibold transition-colors motion-reduce:transition-none',
        {
          'bg-button-disabled text-text-button-disabled':
            disabled && variant !== 'success',
          'hover:opacity-90': !disabled && variant !== 'success',
          'bg-button-success text-text-button-success': variant === 'success',
        },
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
