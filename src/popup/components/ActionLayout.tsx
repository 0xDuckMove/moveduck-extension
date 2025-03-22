/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';
import { useState, type ReactNode } from 'react';
import { Badge } from '../components/ui/badge';
import { Snackbar } from '../components/ui/snackbar';
import {
  ExclamationShieldIcon,
  InfoShieldIcon,
  LinkIcon,
} from '../components/ui/icons';
import {
  ActionButton,
  ActionDateInput,
  ActionEmailInput,
  ActionNumberInput,
  ActionRadioGroup,
  ActionSelect,
  ActionTextInput,
  ActionUrlInput,
} from '../components/ui/inputs';
import { ActionCheckboxGroup } from '../components/ui/inputs/ActionCheckboxGroup';
import { ActionTextArea } from '../components/ui/inputs/ActionTextArea';
import type {
  BaseButtonProps,
  BaseInputProps,
  TStyle,
} from '../components/ui/inputs/types';
import { ExtendedActionState } from '../../api/ActionsRegistry';
import { Action } from '@dialectlabs/blinks';
import { useActionContext } from './hooks/context';

type ActionType = ExtendedActionState;
type ButtonProps = BaseButtonProps;
type InputProps = BaseInputProps;

export type StylePreset = 'default' | 'x-dark' | 'x-light' | 'custom';
export enum DisclaimerType {
  BLOCKED = 'blocked',
  UNKNOWN = 'unknown',
}

export type Disclaimer =
  | {
      type: DisclaimerType.BLOCKED;
      ignorable: boolean;
      hidden: boolean;
      onSkip: () => void;
    }
  | {
      type: DisclaimerType.UNKNOWN;
      ignorable: boolean;
    };

const stylePresetClassMap: Record<StylePreset, string> = {
  default: 'x-light',
  'x-dark': 'x-dark',
  'x-light': 'x-light',
  custom: 'custom',
};

export interface LayoutProps {
  css?: {
    bgColor: string;
    textColor: string;
    buttonBg: string;
  };
  styleId: number;
  stylePreset?: StylePreset;
  image?: string;
  error?: string | null;
  success?: string | null;
  websiteUrl?: string | null;
  websiteText?: string | null;
  disclaimer?: Disclaimer | null;
  type: ActionType;
  title: string;
  description: string;
  buttons?: ButtonProps[];
  inputs?: InputProps[];
  form?: FormProps;
}

export interface FormProps {
  inputs: Array<Omit<InputProps, 'button'>>;
  button: ButtonProps;
}

const Linkable = ({
  url,
  className,
  children,
}: {
  url?: string | null;
  className?: string;
  children: ReactNode | ReactNode[];
}) =>
  url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );

const DisclaimerBlock = ({
  type,
  hidden,
  ignorable,
  onSkip,
  className,
}: {
  type: DisclaimerType;
  ignorable: boolean;
  onSkip?: () => void;
  hidden: boolean;
  className?: string;
}) => {
  if (type === DisclaimerType.BLOCKED && !hidden) {
    return (
      <div className={className}>
        <Snackbar variant="error">
          <p>
            This Action or it&apos;s origin has been flagged as an unsafe
            action, & has been blocked. If you believe this action has been
            blocked in error, please{' '}
            <a
              href="https://discord.gg/saydialect"
              className="cursor-pointer underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              submit an issue
            </a>
            .
            {!ignorable &&
              ' Your action provider blocks execution of this action.'}
          </p>
          {ignorable && onSkip && (
            <button
              className="mt-3 font-semibold transition-colors hover:text-text-error-hover motion-reduce:transition-none"
              onClick={onSkip}
            >
              Ignore warning & proceed
            </button>
          )}
        </Snackbar>
      </div>
    );
  }

  if (type === DisclaimerType.UNKNOWN) {
    return (
      <div className={className}>
        <Snackbar variant="warning">
          <p>
            This Action has not yet been registered. Only use it if you trust
            the source. This Action will not unfurl on X until it is registered.
            {!ignorable &&
              ' Your action provider blocks execution of this action.'}
          </p>
          <a
            className="mt-3 inline-block font-semibold transition-colors hover:text-text-warning-hover motion-reduce:transition-none"
            href="https://discord.gg/saydialect"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report
          </a>
        </Snackbar>
      </div>
    );
  }

  return null;
};

export const ActionLayout = ({
  stylePreset = 'x-dark',
  styleId,
  css,
  title,
  description,
  image,
  websiteUrl,
  websiteText,
  type,
  disclaimer,
  buttons,
  inputs,
  form,
  error,
  success,
}: LayoutProps) => {

  const style = STYLES[styleId];
  const imagePath = chrome.runtime.getURL("public/img/exclude-icon.png");
  console.log("Actionlayout", style)
  return (
    <div style={{
      backgroundColor: "#ffffff00",
      marginTop: "16px",
      marginBottom: "16px",
    }} className={clsx('blink')}>
      <div
        style={{
          // boxShadow: `0 4px 6px ${style.backgroundColor}`,
          backgroundColor: style.backgroundColor,
          borderBottomLeftRadius: style.containerStyle.borderRadius,
          borderBottomRightRadius: style.containerStyle.borderRadius,
         
        }}
        className={`${style.backgroundColor!="#fff" && style.backgroundColor!="#c7bcbc80" && 'p-[2px]'} w-[313px] flex flex-col gap-[18px] cursor-default overflow-hidden rounded-t-[24px]  shadow-action`} // ##1 
      >
        {image && (
          <Linkable
            url={websiteUrl}
            className="block max-h-[100cqw] overflow-y-hidden" // ##2
          >
            <img
            style={{objectFit: style.imageObjectStyle}}
              className={clsx(
                'aspect-auto w-full h-[265px] rounded-[23px] object-cover object-center',
              )}
              src={image}
              alt="action-image"
            />
          </Linkable>
        )}
        <div style={{
          backgroundColor: style.containerStyle.backgroundColor,
          border: style.containerStyle.border,
          opacity: style.containerStyle.opacity,
        }} className={`flex flex-col ${style.containerStyle.borderRadius!="0" && "rounded-t-[30px]"} z-10 bg-[#FFF6DE] relative p-4 mt-[-56px]`}>
         
          <span style={{
            color:style.titleTextColor
          }} className="mb-0.5 text-[24px] font-[500]  text-[#000]">
            {title}
          </span>
            <span style={{
              color: style.descriptionTextColor,
            }} className="mb-4 whitespace-pre-wrap text-[12px] text-[#000000b3]">
            {description}
            </span>
          {disclaimer && (
            <DisclaimerBlock
              className="mb-4"
              type={disclaimer.type}
              ignorable={disclaimer.ignorable}
              hidden={
                disclaimer.type === DisclaimerType.BLOCKED
                  ? disclaimer.hidden
                  : false
              }
              onSkip={
                disclaimer.type === DisclaimerType.BLOCKED
                  ? disclaimer.onSkip
                  : undefined
              }
            />
          )}
          <ActionContent
            styleId={styleId}
            form={form}
            inputs={inputs}
            buttons={buttons}
          />
          {success && (
            <span className="mt-4 flex justify-center text-subtext text-text-success">
              {success}
            </span>
          )}
          {error && !success && (
            <span className="mt-4 flex justify-center text-subtext text-text-error">
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};







export const STYLES: TStyle[] = [
  {
    id: 0,
    containerStyle: {
      border: "1px solid #FFBDBD",
      borderRadius: "23px",
      backgroundColor: "#C7BCBC80",
      opacity: 100,
    },
    titleTextColor: "#ffffff",
    descriptionTextColor: "#FFFFFFB2",
    buttonsStyle: [
      {
        backgroundColor: "#c7bcbc80",
        borderColor: "",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#c7bcbc80",
        borderColor: "",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#c7bcbc80",
        borderColor: "",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#c7bcbc80",
        borderColor: "",
        textColor: "#000000",
        borderRadius: "9999px",
      },
    ],
    imageObjectStyle: "cover",
    backgroundColor: "#c7bcbc80",
  },
  {
    id: 1,
    containerStyle: {
      border: "2px solid #000000",
      borderRadius: "0",
      backgroundColor: "#ffffff",
      opacity: 100,
    },
    titleTextColor: "#000000",
    descriptionTextColor: "#000000",
    buttonsStyle: 
      [{
        backgroundColor: "#EE2B3C",
        borderColor: "#000000",
        textColor: "#ffffff",
        borderRadius: "0",
      },
      {
        backgroundColor: "#FEBD25",
        borderColor: "#000000",
        textColor: "#000000",
        borderRadius: "0",
      },
      {
        backgroundColor: "#000000",
        borderColor: "#000000",
        textColor: "#ffffff",
        borderRadius: "0",
      },
      {
        backgroundColor: "#196EA7",
        borderColor: "#000000",
        textColor: "#ffffff",
        borderRadius: "0",
      },
    ],
    imageObjectStyle: "cover",
    backgroundColor: "#fff",
  },
  {
    id: 2,
    containerStyle: {
      border: "1px solid white",
      borderRadius: "23px",
      backgroundColor: "white",
      opacity: 100,
    },
    titleTextColor: "#000000",
    descriptionTextColor: "#000000",
    buttonsStyle: [
      {
        backgroundColor: "#AEAAAA5C",
        borderColor: "transparent",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#AEAAAA5C",
        borderColor: "transparent",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#AEAAAA5C",
        borderColor: "transparent",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#AEAAAA5C",
        borderColor: "transparent",
        textColor: "#000000",
        borderRadius: "9999px",
      }],
    imageObjectStyle: "cover",
    backgroundColor: "#fff",
  },
  {
    id: 3,
    containerStyle: {
      border: "none",
      borderRadius: "23px",
      backgroundColor: "#FFF6DE",
      opacity: 100,
    },
    titleTextColor: "#000000",
    descriptionTextColor: "#000000",
    buttonsStyle: [
      {
        backgroundColor: "#D1F265",
        borderColor: "#00000000",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#FFDA77",
        borderColor: "#00000000",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#A4FFF9",
        borderColor: "#00000000",
        textColor: "#000000",
        borderRadius: "9999px",
      },
      {
        backgroundColor: "#B5B4FF",
        borderColor: "#00000000",
        textColor: "#000000",
        borderRadius: "9999px",
      },
    ],
    imageObjectStyle: "contain",
    backgroundColor: "#FFF6DE",
  },
];

const ActionContent = ({
  form,
  inputs,
  buttons,
  styleId,
}: Pick<LayoutProps, 'form' | 'buttons' | 'inputs' | 'styleId'>) => {
  if (form) {
    return <ActionForm form={form} />;
  }

  const css: TStyle = STYLES[styleId];
  // active = index+1 (positive is success, negative is fail)
  const [active, setActive] = useState(-1)
  const [fail, setFail] = useState(false)
  const [success, setSuccess] = useState(false)
  const {isActionDone, setIsActionDone, currentAction} = useActionContext();
  console.log('current action', currentAction)
  return (
    <div className="flex flex-col gap-3">
      {buttons && buttons.length > 0 && (
      <div className="grid grid-cols-1 gap-2">
        {buttons?.map((it, index) => (
        <div key={index} className="flex justify-center">
          <ActionButton
          active={active === index}
          {...it}
          variant={success ? (active == index ? 'success' : 'default') : fail ? (active == index ? 'error' : 'default') : 'default'}
          onClick={() => {
            setActive(index);
            it.onClick(
            undefined,
            () => {
              console.log('quiz success');
              if(currentAction == 'quiz')
                setIsActionDone(true);
            },
            () => {
              console.log('quiz failed');
              if(currentAction == 'quiz')
                setIsActionDone(true);
            },
            );
          }}
          css={css.buttonsStyle[index]}
          // className="w-full"
          />
        </div>
        ))}
      </div>
      )}
      {inputs?.map((input) => (
      <ActionInputFactory key={input.name} {...input} />
      ))}
    </div>
  );
};

const buildDefaultFormValues = (
  inputs: InputProps[],
): Record<string, string | string[]> => {
  return Object.fromEntries(
    inputs
      .map((i) => {
        if (i.type === 'checkbox') {
          return [
            i.name,
            i.options?.filter((o: any) => o.selected).map((o: any) => o.value),
          ];
        }

        return i.type === 'radio' || i.type === 'select'
          ? [i.name, i.options?.find((o: any) => o.selected)?.value]
          : null;
      })
      .filter((i) => !!i),
  );
};

const ActionForm = ({ form }: Required<Pick<LayoutProps, 'form'>>) => {
  const [values, setValues] = useState<Record<string, string | string[]>>(
    buildDefaultFormValues(form.inputs),
  );
  const [success, setSuccess] = useState(false);
  const [fail, setFail] = useState(false);
  const [validity, setValidity] = useState<Record<string, boolean>>(
    Object.fromEntries(form.inputs.map((i) => [i.name, false])),
  );

  const onChange = (name: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onValidityChange = (name: string, state: boolean) => {
    setValidity((prev) => ({ ...prev, [name]: state }));
  };

  const disabled = Object.values(validity).some((v) => !v);

  const onSuccess = () => {
    setSuccess(true);
  }

  const onFail = () => {
    setFail(true);
  }
  return (
    <div className="flex flex-col gap-3">
      {form.inputs.map((input) => (
        <ActionInputFactory
          key={input.name}
          {...input}
          onChange={(v) => onChange(input.name, v)}
          onValidityChange={(v) => onValidityChange(input.name, v)}
        />
      ))}
      {/* create a usestate here to handle button click state */}
      <ActionButton
        fail={fail}
        success={success}
        
        {...form.button}
        onClick={() => {
          form.button.onClick(undefined, onSuccess,
          onFail)
          
        }}
        disabled={form.button.disabled || disabled}
      />
    </div>
  );
};

const ActionInputFactory = (
  input: InputProps & {
    onChange?: (value: string | string[]) => void;
    onValidityChange?: (state: boolean) => void;
  },
) => {
  switch (input.type) {
    case 'checkbox':
      return <ActionCheckboxGroup {...input} />;
    case 'radio':
      return <ActionRadioGroup {...input} />;
    case 'date':
    case 'datetime-local':
      return <ActionDateInput {...input} type={input.type} />;
    case 'select':
      return <ActionSelect {...input} />;
    case 'email':
      return <ActionEmailInput {...input} />;
    case 'number':
      return <ActionNumberInput {...input} />;
    case 'url':
      return <ActionUrlInput {...input} />;
    case 'textarea':
      return <ActionTextArea {...input} />;
    default:
      return <ActionTextInput {...input} />;
  }
};
