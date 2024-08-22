import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { setupTwitterObserver } from './twitter';

// Hàm ký giao dịch, nhận vào tham số 'transaction'
export async function signTransaction(transaction: any) {
  // Lấy thông tin địa chỉ từ chrome storage
  chrome.storage.local.get(['address'], async (res) => {
    if (!res.address) {
      console.error('No address found in storage');
      return;
    }

    // Giả định transaction đã có cấu trúc như mong muốn, nếu không cần phải chỉnh sửa trước khi xử lý
    const { data } = transaction;

    const finalTransaction = {
      function: data.function,
      type_arguments: data.typeArguments,
      type: 'entry_function_payload',
      arguments: data.functionArguments,
    };

    // Gửi tin nhắn đến Chrome extension để thực hiện ký giao dịch
    chrome.runtime.sendMessage(
      {
        wallet: 'petra', // Đặt tên ví phù hợp
        type: 'sign_transaction',
        payload: {
          txData: JSON.stringify(finalTransaction),
        },
      },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
        } else if (response.error) {
          console.error('Transaction Error:', response.error);
        } else {
          console.log('Pending Transaction:', response);

          // Cấu hình và chờ kết quả giao dịch trên mạng lưới Aptos
          const config = new AptosConfig({ network: Network.TESTNET });
          const aptos = new Aptos(config);
          try {
            const result = await aptos.waitForTransaction({
              transactionHash: response.hash,
            });

            console.log('Transaction:', result);
          } catch (err) {
            console.error('Error waiting for transaction:', err);
          }
        }
      },
    );
  });
}

interface ActionAdapter {
  signTransaction: (tx: string) => Promise<any>;
  connect: () => Promise<any>;
  confirmTransaction: (transactionHash: string) => Promise<any>;
}

// Adapter setup cho ví
const adapter = (wallet: string): ActionAdapter => {
  return {
    signTransaction: (tx: string) =>
      new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'sign_transaction',
            wallet,
            payload: {
              txData: tx,
            },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          },
        );
      }),
    connect: () =>
      new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            wallet,
            type: 'connect',
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          },
        );
      }),
    confirmTransaction: (transactionHash: string) =>
      new Promise((resolve, reject) => {
        // Gửi tin nhắn để xác nhận giao dịch
        chrome.runtime.sendMessage(
          {
            type: 'confirm_transaction',
            wallet,
            payload: {
              transactionHash,
            },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          },
        );
      }),
  };
};

// Khởi tạo observer cho Twitter
function initTwitterObserver() {
  chrome.runtime.sendMessage({ type: 'getSelectedWallet' }, (wallet) => {
    if (wallet) {
      setupTwitterObserver(adapter(wallet));
    }
  });
}

// Gọi hàm khởi tạo
initTwitterObserver();
