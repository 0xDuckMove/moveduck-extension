import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { CssButtonProps } from './inputs/types';

export const Button = ({
  onClick,
  disabled,
  variant = 'default',
  children,
  css,
}: {
  success?: boolean;
  fail?: boolean;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'success' | 'error' | 'default';
  css: CssButtonProps;
} & PropsWithChildren) => {
  
  return (
    <button
      style={{
        backgroundColor: variant == 'default' ? css.backgroundColor : '',
        color: variant == 'default' ? css.textColor : '',
        borderColor: css.borderColor,
        borderRadius: css.borderRadius,
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
