import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { WalletSelector } from './components/WalletSelector';
import './popup.css';
export const Popup = () => {
  const [isLoading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<string | null>();

  useEffect(() => {
    chrome.storage.local.get(['selectedWallet'], (result) => {
      const storedWallet = result.selectedWallet ?? null;
      setSelectedWallet(storedWallet);
      setLoading(false);
    });
  }, []);

  if (isLoading) return null;
  return (
    <div className="h-full flex flex-1 flex-col items-center px-4 pb-4">
      <Header />
      <div className="flex flex-col mt-20 items-center h-full">
        <h1 className="text-highlight font-bold mb-2">Enable Action</h1>
        <p className="text-tertiary text-subtext mb-8 text-center font-normal">
          Choose a wallet you would like to enable Action for
        </p>
        <WalletSelector
          selectedWallet={selectedWallet}
          setSelectedWallet={setSelectedWallet}
        />
      </div>
    </div>
  );
};
