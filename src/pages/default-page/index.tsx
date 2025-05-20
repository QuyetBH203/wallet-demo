import { Button } from "@/components/ui/button";

export default function DefaultPage() {
    const openCreateWalletTab = () => {
        // Đảm bảo hàm này chỉ chạy trong môi trường extension
        if (chrome && chrome.runtime && chrome.runtime.getURL) {
            const url = chrome.runtime.getURL('index.html#/create-wallet');
            window.open(url, '_blank');
        } else {
            // Fallback cho môi trường development không phải extension (ví dụ: npm run dev)
            // Hoặc bạn có thể điều hướng bằng useNavigate nếu router được cấu hình cho cả popup và trang full
            window.open('#/create-wallet', '_blank'); 
        }
    };

    const openImportWalletTab = () => {
        if (chrome && chrome.runtime && chrome.runtime.getURL) {
            const url = chrome.runtime.getURL('index.html#/import-wallet');
            window.open(url, '_blank');
        } else {
            window.open('#/import-wallet', '_blank');
        }
    };

    return (
        <>
            <div className=" flex flex-col items-center justify-center gap-3 w-full px-4 h-full">
                <Button variant="outline" className="bg-orange-500 border-2 border-black w-full" onClick={openCreateWalletTab}>Create Wallet</Button>
                 <Button variant="outline" className="bg-orange-500 border-2 border-black w-full" onClick={openImportWalletTab}>Import Existing Wallet</Button>
            </div>
        </>
    )
}