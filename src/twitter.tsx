import { createRoot } from "react-dom/client";
import { noop } from "./utils/constants";

export function setupTwitterObserver(
) {
    const observer = new MutationObserver((mutations) => {
        for (let i = 0; i < mutations.length; i++) {
            const mutation = mutations[i];
            for (let j = 0; j < mutation.addedNodes.length; j++) {
                const node = mutation.addedNodes[j];
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }
                handleNewNode(
                    node as Element,
                ).catch(noop);
            }
        }
    });

    const twitterReactRoot = document.getElementById('react-root')!;

    observer.observe(twitterReactRoot, { childList: true, subtree: true });
}


async function handleNewNode(
    node: Element,
) {
    const element = node as Element;
    if (!element || element.localName !== 'div') {
        return;
    }

    let anchor;

    const linkPreview = findLinkPreview(element);

    let container = findContainerInTweet(
        linkPreview?.card ?? element,
        Boolean(linkPreview),
    );
    if (linkPreview) {
        anchor = linkPreview.anchor;
        container && container.remove();
        container = linkPreview.card.parentElement as HTMLElement;
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

    if (!anchor || !container) return;

    addMargin(container).replaceChildren(
        createAction(),
    );
}


function createAction() {
    const container = document.createElement('div');
    container.className = 'dialect-action-root-container';

    const actionRoot = createRoot(container);

    actionRoot.render(
        <div onClick={(e) => e.stopPropagation()}>
            <h1>Test</h1>
            <button>Click me</button>
        </div>,
    );
    return container;
}

function findElementByTestId(element: Element, testId: string) {
    if (element.attributes.getNamedItem('data-testid')?.value === testId) {
        return element;
    }
    return element.querySelector(`[data-testid="${testId}"]`);
}

function findContainerInTweet(element: Element, searchUp?: boolean) {
    const message = searchUp
        ? (element.closest(`[data-testid="tweet"]`) ??
            element.closest(`[data-testid="messageEntry"]`))
        : (findElementByTestId(element, 'tweet') ??
            findElementByTestId(element, 'messageEntry'));

    if (message) {
        return message.querySelector('.dialect-wrapper') as HTMLElement;
    }
    return null;
}

function findLinkPreview(element: Element) {
    const card = findElementByTestId(element, 'card.wrapper');
    if (!card) {
        return null;
    }

    const anchor = card.children[0]?.children[0] as HTMLAnchorElement;

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