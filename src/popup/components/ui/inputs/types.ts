import {
  ActionParameterType,
  SelectableParameterType,
  TypedActionParameter,
} from '../../../../api/actions-spec';

export type InputType = ActionParameterType;

export interface BaseButtonProps {
  css: {
    bg: string;
    color: string;
  };
  text: string | null;
  loading?: boolean;
  variant?: 'default' | 'success' | 'error';
  disabled?: boolean;
  success?: boolean;
  fail?: boolean;
  active?: boolean;
  onClick: (params?: Record<string, string[] | string>,success?: () => void, fail?: () => void) => void;
}

export interface BaseInputProps {
  type: InputType;
  placeholder?: string;
  name: string;
  disabled: boolean;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  pattern?: string;
  description?: string;
  button?: BaseButtonProps;
  options?: TypedActionParameter<SelectableParameterType>['options'];
}
