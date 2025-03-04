import { BaseButtonProps } from '../components/ui/inputs/types';
import { LayoutProps } from '../components/ActionLayout';
import { useEffect, useState } from 'react';
import { ActionLayout } from '../components/ActionLayout';
import { aptosClient } from '../../utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { signTransaction } from '../../contentScript';
import { SERVER } from '../../utils/constants';
import { saveActionId } from '../../utils/storage';
import Completed from './completed';

export type StylePreset = 'default' | 'x-dark' | 'x-light' | 'custom';

const ActionContainer = ({
  stylePreset = 'default',
  apiAction,
  actionTracking
}: {
  stylePreset?: StylePreset;
  apiAction: string;
  actionTracking: boolean;
}) => {
  if(!actionTracking) return <Completed />;
  const [layoutProps, setLayoutProps] = useState<LayoutProps | null>(null);

  interface ActionWithParameters {
    href: string;
    label: string;
    parameters: Array<{
      name: string;
      label: string;
      required: boolean;
    }>;
  }

  const lastPartIndex = apiAction.lastIndexOf('/');
  const actionLink = apiAction.substring(0, lastPartIndex + 1);
  const addressFromLink = apiAction.substring(lastPartIndex + 1) as string;

  interface ActionWithoutParameters {
    href: string;
    label: string;
    parameters?: undefined;
  }

  type Action = ActionWithParameters | ActionWithoutParameters;

  const isActionWithParameters = (
    action: Action,
  ): action is ActionWithParameters => {
    return 'parameters' in action && action.parameters !== undefined;
  };

  const createButton = (action: ActionWithParameters): BaseButtonProps => ({
    text: action.label,
    onClick: (undefined, success?: () => void, fail?: () => void) => handleActionClick(action, success, fail),
    css: {
      bg: layoutProps?.css?.bgColor || '',
      color: layoutProps?.css?.textColor || '',
    },
  });

  function isEmpty(obj: object) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
    return true;
  }

  const handleActionClick = async (action: Action, onSuccess?: () => void, onFailed?: () => void) => {
    const account = await chrome.storage.local.get('address');
    const actionString = action.href.split(SERVER)[1].split('/')[1];
    console.log('action', actionString);
    if(actionString == 'quiz') {
      const quizId = action.href.split(SERVER)[1].split('/')[3].split('?')[0];
      if(quizId)
        await saveActionId(quizId);
    }
    if (isEmpty(account) || !account.address) {
      chrome.runtime.sendMessage(
        {
          wallet: 'petra',
          type: 'connect',
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
          } else {
            chrome.storage.local.set({ address: response });
          }
        },
      );
      console.error('No account found');
      return;
    }
    try {
      let url = action.href;

      if (isActionWithParameters(action)) {
        const params = action.parameters.reduce((acc: any, param) => {
          const inputElement = document.querySelector(
            `[name="amount-value"]`,
          ) as HTMLInputElement;
          const value = inputElement?.value;

          if (param.required && !value) {
            alert(`The ${param.label} is required.`);
            return acc;
          }

          if (value) {
            acc[param.name] = encodeURIComponent(value);
          }

          return acc;
        }, {});

        Object.keys(params).forEach((key) => {
          url = url.replace(`{${key}}`, params[key]);
        });
      }

      const body = {
        fromAddress: account.address as string,
        toAddress: addressFromLink,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const result = await response.json();
      console.log('result', result);
      const { transaction, message } = result;
      if(!transaction && onFailed) {
        onFailed()
        return;
      }
      const success = await signTransaction(transaction);
      console.log('excute success', success);
      if(success && onSuccess) onSuccess()
    } catch (error) {
      console.error('Error handling action click:', error);
      onFailed && onFailed()
    }
  };

  const mapApiResponseToLayoutProps = (
    apiResponse: any,
    baseUrl: string,
  ): LayoutProps => {
    const actionsWithParameters = apiResponse.links.actions.filter(
      isActionWithParameters,
    );

    const actionsWithoutParameters = apiResponse.links.actions.filter(
      (action: Action): action is ActionWithoutParameters =>
        !('parameters' in action) || action.parameters === undefined,
    );
   
    return {
      css: {
        bgColor: apiResponse.css.backgroundColor,
        textColor: apiResponse.css.textColor,
        buttonBg: apiResponse.css.buttonBg,
      },
      stylePreset: stylePreset,
      title: apiResponse.title,
      description: apiResponse.description.trim(),
      image: apiResponse.icon,
      type: 'trusted',
      websiteUrl: baseUrl,
      websiteText: baseUrl,
      buttons: actionsWithoutParameters.map((action: any) => ({
        label: action.label,
        text: action.label,
        onClick: (success: () => void, fail: () => void) => handleActionClick(action, success, fail),
      })),
      inputs: actionsWithParameters.flatMap((action: any) =>
        action.parameters.map((param: any) => ({
          type: 'text',
          name: param.name,
          placeholder: param.label,
          required: param.required,
          disabled: false,
          button: createButton(action),
        })),
      ),
    };
  };

  useEffect(() => {
    const fetchApiData = async () => {
      if (addressFromLink) {
        try {
          const response = await fetch(actionLink);
          const data = await response.json();
          const baseUrl = new URL(actionLink).origin;
          const mappedProps = mapApiResponseToLayoutProps(data, baseUrl);
          console.log(mappedProps, data);
          setLayoutProps(mappedProps);
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      }
    };

    fetchApiData();
  }, []);

  console.log('layoutProps', layoutProps);
  return layoutProps ? (
    <div className="w-full max-w-md">
      <ActionLayout {...layoutProps} />
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default ActionContainer;
