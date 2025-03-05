import { createRoot } from 'react-dom/client';
import { noop, QUIZ_ACTION } from './utils/constants';
import ActionContainer from './popup/components/ActionContainer';
import { StylePreset } from './popup/components/ActionLayout';
import '@dialectlabs/blinks/index.css';
// override the default styles
import './index.css';
import { ActionAdapter } from './api/ActionConfig';
import { ActionCallbacksConfig, ObserverOptions } from '@dialectlabs/blinks';
import { checkSecurity, SecurityLevel } from './shared';
import {
  ActionsRegistry
} from './api/ActionsRegistry';
import { SERVER } from './utils/constants';
import { actionTracking } from './utils/storage';
import Completed from './popup/components/completed';
import { parseUrl } from './utils/url-parser';

//init constants


type ObserverSecurityLevel = SecurityLevel;

interface NormalizedObserverOptions {
  securityLevel: Record<
    'websites' | 'interstitials' | 'actions',
    ObserverSecurityLevel
  >;
}

const DEFAULT_OPTIONS: ObserverOptions = {
  securityLevel: 'only-trusted',
};

const normalizeOptions = (
  options: Partial<ObserverOptions>,
): NormalizedObserverOptions => {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    securityLevel: (() => {
      if (!options.securityLevel) {
        return {
          websites: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
          interstitials: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
          actions: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
        };
      }

      if (typeof options.securityLevel === 'string') {
        return {
          websites: options.securityLevel,
          interstitials: options.securityLevel,
          actions: options.securityLevel,
        };
      }

      return options.securityLevel;
    })(),
  };
};

export function setupTwitterObserver(
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig> = {},
  options: Partial<ObserverOptions> = DEFAULT_OPTIONS,
) {
  const mergedOptions = normalizeOptions(options);
  const twitterReactRoot = document.getElementById('react-root')!;

  const refreshRegistry = async () => {
    return ActionsRegistry.getInstance().init();
  };

  // if we don't have the registry, then we don't show anything
  refreshRegistry().then(() => {
    // entrypoint
    const observer = new MutationObserver((mutations) => {
      // it's fast to iterate like this
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j];
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          handleNewNode(
            node as Element,
            config,
            callbacks,
            mergedOptions,
          ).catch(noop);
        }
      }
    });

    observer.observe(twitterReactRoot, { childList: true, subtree: true });
  });
}


async function handleNewNode(
  node: Element,
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig>,
  options: NormalizedObserverOptions,
) {
  const element = node as Element;
  // first quick filtration
  if (!element || element.localName !== 'div') {
    return;
  }

  let anchor;

  const linkPreview = findLinkPreview(element);

  let container = findContainerInTweet(
    linkPreview?.card ?? element,
    Boolean(linkPreview),
  );
  let actionApiUrl = '';
  let targetElement: HTMLElement | undefined = undefined;
  let actionTrackingResult = true;
  if (linkPreview) {
    anchor = linkPreview.anchor;
    // container && container.remove();
    const listATags = ((linkPreview.card.children[0] as HTMLElement).children[0] as HTMLElement
      ).getElementsByTagName('a');

    let actionIdFromHashtash = '';
    let actionFromHashtash = '';
    // let targetElement: HTMLElement | undefined = undefined;
    
    console.log('listATags', Array.from(listATags) as HTMLElement[]);
    Array.from(listATags).forEach((aTag) => {
      if (aTag.href.includes('/hashtag/moveduck')) {
        actionIdFromHashtash = aTag.innerText.split('_')[2];
        actionFromHashtash = aTag.innerText.split('_')[1];
        targetElement = aTag.parentElement as HTMLElement;
        container =((targetElement.parentElement as HTMLElement).parentElement as HTMLElement).children[1] as HTMLElement;
      }
    });
    // if no actionIdFromHashtash and actionFromHashtash, then get the link from the post
    if(actionFromHashtash == '' && actionIdFromHashtash == '') {
      const linkFromPost = Array.from(listATags).find((aTag) => aTag.href.includes('https://t.co'));
      if(linkFromPost){
        const url = await resolveTwitterShortenedUrl(linkFromPost.href)
          if(url){
            actionApiUrl = url.href;
            const {action, actionId} = parseUrl(url.href);
            actionTrackingResult = await actionTracking(action, actionId);
            const {container: containerFromchild, targetElement: targetElementFromChild} = containerFromChild(linkFromPost);
            container = containerFromchild;
            targetElement = targetElementFromChild;
          }
      }
    }else {
      actionApiUrl = `${SERVER}/${actionFromHashtash}/hashtag?id=${actionIdFromHashtash}/0x2`;
      actionTrackingResult = await actionTracking(actionFromHashtash, dataMapping[parseInt(actionIdFromHashtash)-1]);

    };

    console.log('actionApiUrl', actionApiUrl);
    console.log('container', container);
    console.log('target', targetElement)

   

   
  } else {
    if (container) {
      return;
    }
    const link = findLastLinkInText(element);
    if (link) {
      anchor = link.anchor;
      container = getContainerForLink(link.tweetText);
    }
  }
 
  
  if(!container || !targetElement) return;
  const articleContainer = element.getElementsByTagName('article')[0];
  // remove default css class (overflow)
  if (articleContainer) {
    articleContainer.style.overflow='revert-layer'
    articleContainer.classList.remove('r-1udh08x')
    if(articleContainer.classList.contains('r-1udh08x'))
        articleContainer.classList.replace('r-1udh08x', 'replace');
    console.log('classlist', articleContainer.classList);
  }
  addMargin(container).replaceChildren(createAction(actionApiUrl, container.parentElement as HTMLElement, targetElement, actionTrackingResult));
}

function createAction(actionAPI: string, parent: HTMLElement, text: HTMLElement, actionTracking: boolean) {
  const container = document.createElement('div');
  addPopupCss(container);
  const actionRoot = createRoot(container);
  text.onmouseenter = (e) => {
    container.style.display = 'block';
    requestAnimationFrame(() => {
      container.style.opacity = '1';
      container.style.height = 'auto';
    });
  }
  container.onmouseleave = (e) => {
    container.style.opacity = '0';
    // add animation
    container.addEventListener('transitionend', () => {
      container.style.height = '0px';
    }, { once: true });
  }
  
  actionRoot.render(
    <div onClick={(e) => e.stopPropagation()}>
      <ActionContainer
        stylePreset={resolveXStylePreset()}
        apiAction={actionAPI}
      />
    </div>,
  );
  
  return container;
}

const resolveXStylePreset = (): StylePreset => {
  const colorScheme = document.querySelector('html')?.style.colorScheme;

  if (colorScheme) {
    return colorScheme === 'dark' ? 'x-dark' : 'x-light';
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'x-dark' : 'x-light';
};

async function resolveTwitterShortenedUrl(shortenedUrl: string): Promise<URL> {
  const res = await fetch(shortenedUrl);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const actionUrl = doc.querySelector('title')?.textContent;
  return new URL(actionUrl!);
}

function findElementByTestId(element: Element, testId: string) {
  if (element.attributes.getNamedItem('data-testid')?.value === testId) {
    return element;
  }
  return element.querySelector(`[data-testid="${testId}"]`);
}

function findContainerInTweet(element: Element, searchUp?: boolean) {
  // const message = searchUp
  //   ? (element.closest(`[data-testid="tweet"]`) ??
  //     element.closest(`[data-testid="messageEntry"]`))
  //   : (findElementByTestId(element, 'tweet') ??
  //     findElementByTestId(element, 'messageEntry'));
  // console.log(
  //   'message',
  //   message,
  //   message && (message.querySelector('.dialect-wrapper') as HTMLElement),
  //   element.closest(`[data-testid="tweet"]`),
  //   findElementByTestId(element, 'tweet'),
  // );
  const message = element.closest(`[data-testid="tweet"]`);

  if (message) {
    return message.querySelector('.dialect-wrapper') as HTMLElement;
  }
  return null;
}

function findLinkPreview(element: Element) {
  const card = findElementByTestId(element, 'cellInnerDiv');
  if (!card) {
    return null;
  }

  const anchor = card.children[0]?.children[0] as HTMLAnchorElement;
  //anchor is article tag

  return anchor ? { anchor, card } : null;
}

function findLastLinkInText(element: Element) {
  const tweetText = findElementByTestId(element, 'tweetText');
  if (!tweetText) {
    return null;
  }
  const links = tweetText.getElementsByTagName('a');
  if (links.length > 0) {
    const anchor = links[links.length - 1] as HTMLAnchorElement;
    return { anchor, tweetText };
  }
  return null;
}

function getContainerForLink(tweetText: Element) {
  const root = document.createElement('div');
  root.className = 'dialect-wrapper';
  const dm = tweetText.closest(`[data-testid="messageEntry"]`);
  if (dm) {
    root.classList.add('dialect-dm');
    tweetText.parentElement?.parentElement?.prepend(root);
  } else {
    tweetText.parentElement?.append(root);
  }
  return root;
}

function addMargin(element: HTMLElement) {
  if (element && element.classList.contains('dialect-wrapper')) {
    element.style.marginTop = '12px';
    if (element.classList.contains('dialect-dm')) {
      element.style.marginBottom = '8px';
    }
  }
  return element;
}

function addPopupCss(component: HTMLElement) {
  component.className = 'dialect-action-root-component';
  component.style.bottom = '100px';
  component.style.zIndex = '1000';
  component.style.left = '100px';
  component.style.width = '512px';
  component.style.height = '0px';
  component.style.opacity = '0';
  component.style.overflow = 'hidden';
  component.style.transition = 'all 0.4s ease-in-out';
}

function containerFromChild(aTag: HTMLAnchorElement) {
  const targetElement = aTag.parentElement as HTMLElement;
  const parent = ((targetElement.parentElement as HTMLElement).parentElement as HTMLElement).children[1] as HTMLElement;
  const container = parent.getElementsByClassName('dialect-wrapper')[0] as HTMLElement;
  return {container, targetElement};
}

const dataMapping = ['bafkreih3q576toj7g7cubdajfah3w2lmeql5p72jebdhauaiwekgv2fk7a']
