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
        <span className="flex block w-full h-full flex-row items-center justify-center gap-2 text-nowrap">
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
      <span className="min-w-0 truncate">
        <ButtonContent />
        {variant == 'success' && <CheckIcon />}
      </span>
    </Button>
  );
};
