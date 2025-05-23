import { useRoutes } from 'react-router-dom'
import { routes } from './setting/route/route'
import { Toaster } from 'react-hot-toast'

function App() {
  const element = useRoutes(routes)
  return (
    <>
      <div className='flex flex-col items-center justify-center h-full'>
        <div className=' flex flex-col justify-between gap-3 mt-4 w-full h-full'>{element}</div>
      </div>
      <Toaster
        position='top-left'
        toastOptions={{
          duration: 2000,
          style: {
            fontSize: '16px',
            padding: '16px',
            minWidth: '300px'
          }
        }}
      />
    </>
  )
}

export default App
