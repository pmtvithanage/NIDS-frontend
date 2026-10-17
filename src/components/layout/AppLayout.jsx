import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import LoadingSkeleton from '../common/LoadingSkeleton.jsx'

/**
 * App shell: sidebar + topbar + routed content.
 */
function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="relative flex-1 overflow-y-auto p-4 md:p-6">
          <Suspense fallback={<LoadingSkeleton className="mt-6" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
