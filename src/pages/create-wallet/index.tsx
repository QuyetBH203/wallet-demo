import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HDNodeWallet, Mnemonic } from 'ethers/wallet';
import * as bip39 from 'bip39';
import { useNavigate } from 'react-router-dom';

export default function CreateWalletPage() {
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [error, setError] = useState('');
    const [mnemonicPhrase, setMnemonicPhrase] = useState<string | null>(null);
    const [walletCreated, setWalletCreated] = useState(false);
    const navigate = useNavigate();

    const handleCreateWallet = async () => {
        if (password !== retypePassword) {
            setError('Passwords do not match!');
            setMnemonicPhrase(null);
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            setMnemonicPhrase(null);
            return;
        }
        setError('');

        try {
            const generatedMnemonicPhrase = bip39.generateMnemonic();
            if (!generatedMnemonicPhrase) {
                setError('Could not generate mnemonic using bip39. Please try again.');
                return;
            }
            setMnemonicPhrase(generatedMnemonicPhrase);

            alert(`IMPORTANT: Please save these 12 words in a safe place. This is the only way to recover your wallet:\n\n${generatedMnemonicPhrase}`);
            
            const mnemonicObject = Mnemonic.fromPhrase(generatedMnemonicPhrase);
            const walletInstance = HDNodeWallet.fromMnemonic(mnemonicObject, "m/44'/60'/0'/0/0");
            const encryptedKeystoreJson = await walletInstance.encrypt(password);

            if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ walletKeystore: encryptedKeystoreJson }, () => {
                    if (chrome.runtime.lastError) {
                        setError(`Error saving wallet: ${chrome.runtime.lastError.message}`);
                        setMnemonicPhrase(null);
                    } else {
                        console.log('Encrypted wallet keystore saved to chrome.storage.local');
                        setWalletCreated(true);
                        setPassword('');
                        setRetypePassword('');
                    }
                });
            } else {
                localStorage.setItem('walletKeystore', encryptedKeystoreJson);
                console.warn('chrome.storage.local not found. Wallet keystore saved to localStorage (unsafe for production).');
                setWalletCreated(true);
                setPassword('');
                setRetypePassword('');
            }

        } catch (e) {
            console.error("Error creating wallet:", e);
            let errorMessage = 'Unknown error';
            if (e instanceof Error) {
                errorMessage = e.message;
            }
            setError(`Error creating wallet: ${errorMessage}`);
            setMnemonicPhrase(null);
        }
    };

    if (walletCreated) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 gap-4 text-center">
                <h1 className="text-2xl font-bold mb-4 text-green-600">Wallet Created Successfully!</h1>
                <p className="mb-4">Your encrypted wallet has been saved.</p>
                {mnemonicPhrase && (
                    <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-2">Your 12-word Recovery Phrase:</h2>
                        <p className="text-sm text-red-600 mb-2"><strong>Store these words in a safe place. This is the ONLY way to recover your wallet.</strong></p>
                        <p className="font-mono bg-gray-200 p-2 rounded break-words">{mnemonicPhrase}</p>
                    </div>
                )}
                <p className="mb-2">You can now close this tab or go to your transactions page.</p>
                <Button 
                    className="bg-blue-500 hover:bg-blue-600 text-white w-full max-w-xs"
                    onClick={() => navigate('/transactions')}
                >
                    Go to Transactions
                </Button>
                 <Button 
                    variant="outline"
                    className="w-full max-w-xs mt-2"
                    onClick={() => window.close()}
                >
                    Close Tab
                </Button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
            <h1 className="text-2xl font-bold mb-1">Create New Wallet</h1>
            {mnemonicPhrase && !walletCreated && (
                 <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded w-full max-w-md">
                    <h2 className="text-lg font-semibold mb-2">Your 12-word Recovery Phrase:</h2>
                    <p className="text-sm text-red-600 mb-2"><strong>IMPORTANT: Write down these words in the exact order and store them in a secure offline location. Anyone with these words can access your funds.</strong></p>
                    <p className="font-mono bg-gray-200 p-2 rounded break-words">{mnemonicPhrase}</p>
                    <p className="text-xs mt-2">After saving your phrase, the wallet will be encrypted with your password and stored.</p>
                </div>
            )}

            {!mnemonicPhrase && (
                <>
                    <p className="text-sm text-gray-600 mb-3 text-center max-w-xs">Create a strong password to secure your new wallet. This password will be used to encrypt your private keys.</p>
                    <div className="w-full max-w-xs flex flex-col gap-2">
                        <label htmlFor="password">Password:</label>
                        <Input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter password (min 8 chars)"
                            className="border-black"
                            disabled={!!mnemonicPhrase}
                        />
                    </div>

                    <div className="w-full max-w-xs flex flex-col gap-2">
                        <label htmlFor="retypePassword">Retype Password:</label>
                        <Input 
                            type="password" 
                            id="retypePassword"
                            value={retypePassword} 
                            onChange={(e) => setRetypePassword(e.target.value)} 
                            placeholder="Retype password"
                            className="border-black"
                            disabled={!!mnemonicPhrase}
                        />
                    </div>
                </>
            )}

            {error && <p className="text-red-500 mt-2">{error}</p>}
            
            <Button 
                className="bg-orange-500 border-2 border-black w-full max-w-xs mt-4"
                onClick={handleCreateWallet}
                disabled={!!mnemonicPhrase && !error}
            >
                {mnemonicPhrase ? (error ? 'Retry Wallet Creation' : 'Encrypting & Saving Wallet...') : 'Generate Recovery Phrase & Create Wallet'}
            </Button>
            {mnemonicPhrase && !walletCreated && !error && <p className='text-xs mt-2'>Wallet is being generated, encrypted and saved...</p>}
        </div>
    );
}