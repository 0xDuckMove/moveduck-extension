import {
  ActionParameterType,
  SelectableParameterType,
  TypedActionParameter,
} from '../../../../api/actions-spec';

export type InputType = ActionParameterType;


export type TStyle = {
  id: number;
  imageObjectStyle: "contain" | "cover" | "none";
  backgroundColor: string;
  containerStyle: {
    border: string;
    borderRadius: string;
    backgroundColor: string;
    opacity: number;
  };
  titleTextColor: string;
  descriptionTextColor: string;
  buttonsStyle: CssButtonProps[]
};

export interface CssButtonProps {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  borderRadius: string;
}

export interface BaseButtonProps {
  css: CssButtonProps;
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
