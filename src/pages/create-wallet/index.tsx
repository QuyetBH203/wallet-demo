import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateWalletPage() {
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [error, setError] = useState('');

    const handleCreateWallet = () => {
        if (password !== retypePassword) {
            setError('Passwords do not match!');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setError('');
        // TODO: Implement wallet creation logic
        console.log('Password:', password);
        alert('Wallet creation logic to be implemented. Check console for password.');
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 gap-4">
            <h1 className="text-2xl font-bold mb-4">Create New Wallet</h1>
            
            <div className="w-full max-w-xs flex flex-col gap-2">
                <label htmlFor="password">Password:</label>
                <Input 
                    type="password" 
                    id="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter password (min 8 chars)"
                    className="border-black"
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
                />
            </div>

            {error && <p className="text-red-500">{error}</p>}
            
            <Button 
                className="bg-orange-500 border-2 border-black w-full max-w-xs mt-4"
                onClick={handleCreateWallet}
            >
                Create Wallet
            </Button>
        </div>
    );
}