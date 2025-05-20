import { Routes, Route } from 'react-router-dom';
import DefaultPage from "./pages/default-page"
import CreateWalletPage from "./pages/create-wallet"
import ImportWalletPage from "./pages/import-wallet"

function App() {
 
  return (
    <>
      <div className="flex flex-col items-center justify-center h-full">
        {/* <h1 className='text-2xl font-bold'>BHQ Wallet</h1> */}
        <div className=" flex flex-col justify-between gap-3 mt-4 w-full h-full">
          <Routes>
            <Route path="/" element={<DefaultPage />} />
            <Route path="/create-wallet" element={<CreateWalletPage />} />
            <Route path="/import-wallet" element={<ImportWalletPage />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
