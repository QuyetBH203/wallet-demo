import { useRoutes } from 'react-router-dom'
import { routes } from './setting/route/route'

function App() {
  const element = useRoutes(routes)
  return (
    <>
      <div className='flex flex-col items-center justify-center h-full'>
        <div className=' flex flex-col justify-between gap-3 mt-4 w-full h-full'>{element}</div>
      </div>
    </>
  )
}

export default App
