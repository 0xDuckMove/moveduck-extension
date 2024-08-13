import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// import '@dialectlabs/blinks/index.css';
// import { setupTwitterObserver } from '@dialectlabs/blinks/ext/twitter';
// import { ActionConfig } from '@dialectlabs/blinks';

// const adapter = (wallet: string) =>
//   new ActionConfig(import.meta.env.VITE_RPC_URL, {
//     signTransaction: (tx: string) =>
//       chrome.runtime.sendMessage({
//         type: 'sign_transaction',
//         wallet,
//         payload: {
//           txData: tx,
//         },
//       }),
//     connect: () =>
//       chrome.runtime.sendMessage({
//         wallet,
//         type: 'connect',
//       }),
//   });

// function initTwitterObserver() {
//   chrome.runtime.sendMessage({ type: 'getSelectedWallet' }, (wallet) => {
//     if (wallet) {
//       setupTwitterObserver(adapter(wallet));
//     }
//   });
// }

// initTwitterObserver();


async function signTransaction() {
  chrome.storage.local.get(['address'], async function (res) {
    const result = JSON.parse(`{
    "transaction": {
        "data": {
            "function": "0x1::coin::transfer",
            "typeArguments": [
                "0x1::aptos_coin::AptosCoin"
            ],
            "functionArguments": [
                "0x0bd634d9cad82957af1f1338de981fd33e0d1928e16f0b27731e4d1b0e6e4738",
                100000000
            ]
        }
    },
    "message": "Send 1 APT to 0x0bd634d9cad82957af1f1338de981fd33e0d1928e16f0b27731e4d1b0e6e4738"
}`);

    // @ts-ignore
    const { transaction: { data }, message
    } = result;

    const finalTransaction = {
      function: data.function,
      type_arguments: data.typeArguments,
      type: 'entry_function_payload',
      arguments: data.functionArguments,
    }

    chrome.runtime.sendMessage({
      wallet: "petra",
      type: 'sign_transaction',
      payload: {
        txData: JSON.stringify(finalTransaction),
      }
    }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
      } else {
        console.log('Pending Transaction:', response);
        const config = new AptosConfig({ network: Network.TESTNET });
        const aptos = new Aptos(config);
        const result = await aptos.waitForTransaction({
          transactionHash: response.hash,
        });
        console.log('Transaction:', result);
      }
    })
  });
}

const connectWalletBtn = document.createElement('button');
connectWalletBtn.textContent = 'Connect Wallet';
connectWalletBtn.style.position = 'absolute';
connectWalletBtn.style.bottom = '0px';
connectWalletBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    wallet: "petra",
    type: 'connect',
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    } else {
      console.log('Address:', response);
      chrome.storage.local.set({ address: response });
    }
  })
});
document.body.appendChild(connectWalletBtn);

const signBtn = document.createElement('button');
signBtn.textContent = 'Sign';
signBtn.style.position = 'absolute';

signBtn.addEventListener('click', () => {
  signTransaction();
});

document.body.appendChild(signBtn);

