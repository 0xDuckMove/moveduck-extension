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
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    const anchors = [
                        ...(element.tagName.toLowerCase() === 'a' ? [element] : []),
                        ...element.querySelectorAll('a')
                    ];

                    for (const anchor of anchors) {
                        const href = anchor.getAttribute('href');
                        if (href && href.toLowerCase().startsWith('http')) {
                            console.log('Found anchor element with http link');
                            handleNewNode(anchor).catch(noop);
                        }
                    }
                }
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

    element.replaceChildren(createAction());
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