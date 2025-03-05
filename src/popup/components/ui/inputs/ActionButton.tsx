import { Button } from '../button-card';
import { CheckIcon, SpinnerDots } from '../icons';
import { BaseButtonProps } from './types';

export const ActionButton = ({
  css,
  text,
  loading,
  disabled,
  variant,
  
  onClick,
}: BaseButtonProps) => {
  const ButtonContent = () => {
    if (loading)
      return (
        <span className="flex w-full h-full flex-row items-center justify-center gap-2 text-nowrap">
          {text} <SpinnerDots />
        </span>
      );
   
    return text;
  };

  return (
    <Button
      text={css.color}
      bg={css.bg}
      onClick={() => {
        if(variant == 'success' || variant == 'error'){
          console.log('variant', variant)
          return;
        }
        onClick()}}
      disabled={disabled}
      variant={variant}
    >
      <span className="min-w-0 truncate text-[14px] font-[500]">
        <ButtonContent />
        {variant == 'success' && <CheckIcon />}
      </span>
    </Button>
  );
};
