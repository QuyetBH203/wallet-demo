import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"


export default function TransactionPage() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWalletAddress = async () => {
            if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['walletKeystore'], (result) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error fetching keystore:', chrome.runtime.lastError.message);
                        setError('Could not load wallet data. ');
                        return;
                    }
                    const keystoreJson = result.walletKeystore;
                    if (keystoreJson) {
                        try {
                            const keystore = JSON.parse(keystoreJson);
                            // Ethers.js v5/v6 keystore typically has an 'address' field directly
                            // For v6, it might also be under crypto.address or similar, but usually top-level for address.
                            // The address in the keystore is usually prefixed with '0x' already.
                            if (keystore && keystore.address) {
                                setWalletAddress(keystore.address);
                            } else {
                                console.warn('Address not found directly in keystore object:', keystore);
                                setError('Address not found in wallet data. The keystore might be in an unexpected format or version.');
                                // As a fallback for some keystore versions or if direct address isn't there,
                                // you might need to provide a way to get it from the ID or xpub, but that's more complex.
                                // For now, we assume 'address' field is present.
                            }
                        } catch (parseError) {
                            console.error('Error parsing keystore JSON:', parseError);
                            setError('Could not parse wallet data.');
                        }
                    } else {
                        setError('No wallet found. Please create or import a wallet first.');
                    }
                });
            } else {
                // Fallback for non-extension environment (e.g., development with localStorage)
                const keystoreJson = localStorage.getItem('walletKeystore');
                if (keystoreJson) {
                    try {
                        const keystore = JSON.parse(keystoreJson);
                        if (keystore && keystore.address) {
                            setWalletAddress(keystore.address);
                        } else {
                             setError('Address not found in wallet data (localStorage).');
                        }
                    } catch (parseError) {
                        console.error('Error parsing keystore JSON (localStorage):', parseError);
                        setError('Could not parse wallet data (localStorage).');
                    }
                } else {
                    setError('No wallet found (localStorage). Please create or import a wallet first.');
                }
                console.warn('chrome.storage.local not available, attempting to use localStorage.');
            }
        };

        fetchWalletAddress();
    }, []); // Empty dependency array ensures this runs once on mount

    return (
        <div className="flex flex-col items-center justify-start h-full p-4 gap-4 pt-10">
            <h1 className="text-3xl font-bold mb-6">Home Page</h1>
            
            {error && (
                <div className="text-red-500 bg-red-100 border border-red-400 p-3 rounded w-full max-w-md text-center">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {walletAddress && (
                <div className="w-full max-w-lg p-4 bg-gray-50 border border-gray-300 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">Your Wallet Address:</h2>
                    <p 
                        className="font-mono text-sm bg-gray-200 p-3 rounded break-all cursor-pointer hover:bg-gray-300"
                        onClick={() => navigator.clipboard.writeText(walletAddress)}
                        title="Click to copy address"
                    >
                        {walletAddress}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 text-center">Click the address to copy it.</p>
                </div>
            )}

            {!walletAddress && !error && (
                <p>Loading wallet address...</p>
            )}

            {/* TODO: Add transaction list and creation form here */}
            <div className="mt-8 w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Action:</h2>
                <div className=' flex flex-row justify-between'>
                    <Button variant="outline" className="bg-orange-500 border-2 border-black">Send</Button>
                    <Button variant="outline" className="bg-orange-500 border-2 border-black">Receive</Button>
              </div>
                
            </div>
        </div>
    );
}