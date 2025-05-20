import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DefaultPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkWalletExists = async () => {
            let keystoreExists = false;
            if (chrome && chrome.storage && chrome.storage.local) {
                try {
                    const result: { [key: string]: string | undefined } = await new Promise((resolve) => {
                        chrome.storage.local.get(['walletKeystore'], (res) => {
                            if (chrome.runtime.lastError) {
                                console.warn('Error checking keystore (might not exist yet):', chrome.runtime.lastError.message);
                                resolve({});
                            } else {
                                resolve(res || {});
                            }
                        });
                    });
                    if (result && result.walletKeystore) {
                        keystoreExists = true;
                    }
                } catch (error) {
                    console.warn('Error accessing chrome.storage.local during initial check:', error);
                }
            } else {
                if (localStorage.getItem('walletKeystore')) {
                    keystoreExists = true;
                }
            }

            if (keystoreExists) {
                navigate('/login');
            }
        };

        checkWalletExists();
    }, [navigate]);

    return (
        <>
            <div className="flex flex-col items-center justify-center h-full p-4">
                <h1 className='text-3xl font-bold mb-8 text-center'>BHQ Wallet</h1>
                <p className="text-sm text-gray-600 mb-6 text-center max-w-xs">
                    Welcome! Create a new wallet or import an existing one to get started.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xs px-4">
                    <Button 
                        variant="outline" 
                        className="bg-orange-500 border-2 border-black w-full hover:bg-orange-600 text-white py-3"
                        onClick={() => navigate('/create-wallet')}
                    >
                        Create New Wallet
                    </Button>
                    <Button 
                        variant="outline" 
                        className="bg-gray-500 border-2 border-black w-full hover:bg-gray-600 text-white py-3"
                        onClick={() => navigate('/import-wallet')}
                    >
                        Import Existing Wallet
                    </Button>
                </div>
            </div>
        </>
    )
}