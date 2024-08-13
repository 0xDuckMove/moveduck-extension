chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('on message', msg, sender);
  if (!sender.tab || !sender.tab.id) {
    return null;
  }
  if (msg.type === 'getSelectedWallet') {
    chrome.storage.local.get(['selectedWallet'], (storage) => {
      sendResponse(storage.selectedWallet);
    });
    return true;
  }

  if (!msg.wallet) return false;
  handleWalletCommunication(sender.tab.id, msg.type, msg.wallet, msg.payload)
    .then((res) => {
      sendResponse(res);
    })
    .catch((err) => {
      console.error('error handling message', err);
    });

  return true;
});

async function handleWalletCommunication(
  tabId: number,
  type: string,
  wallet: string,
  payload: object,
) {
  if (type === 'connect') {
    console.log('connecting wallet', wallet);
    const res = await chrome.scripting.executeScript({
      world: 'MAIN',
      target: { tabId: tabId },
      func:
        async () => {
          // @ts-ignore
          const provider = window.aptos;
          const res = await provider.connect();
          return res.address.toString();
        }
    });
    return res[0].result;
  } else if (type === 'sign_message') {
    // @ts-ignore
    console.log('signing message', payload.message);
    const res = await chrome.scripting.executeScript({
      world: 'MAIN',
      target: { tabId: tabId },
      func: async (message: string) => {
        const provider =
          // @ts-ignore
          wallet === 'solflare' ? window.solflare : window.solana;
        const textToSign = new TextEncoder().encode(message);
        const res = await provider.signMessage(textToSign);
        return res;
      },
      // @ts-ignore
      args: [payload.message, wallet],
    });
    return res[0].result;
  } else if (type === 'sign_transaction') {
    // @ts-ignore
    console.log('signing transaction', wallet, payload.txData);
    const res = await chrome.scripting.executeScript({
      world: 'MAIN',
      target: { tabId: tabId },
      func: async (transaction: string, wallet) => {
        try {
          const res =
            // @ts-ignore
            // await window.aptos.signAndSubmitTransaction({
            //   function: "0x1::coin::transfer",
            //   type_arguments: [
            //     "0x1::aptos_coin::AptosCoin"
            //   ],
            //   type: 'entry_function_payload',
            //   arguments: [
            //     "0x0bd634d9cad82957af1f1338de981fd33e0d1928e16f0b27731e4d1b0e6e4738",
            //     100000000
            //   ]
            // })

            // @ts-ignore
            await window.aptos.signAndSubmitTransaction(JSON.parse(transaction));

          console.log('result', res);
          return res;
        } catch (e: any) {
          console.log('error', e);
          return { error: e.message ?? 'Unknown error' };
        }
      },
      // @ts-ignore
      args: [payload.txData, wallet],
    });
    return res[0].result;
  }
}
