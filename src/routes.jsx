import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AppLayout from './components/layout/AppLayout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import LoadingSkeleton from './components/common/LoadingSkeleton.jsx'

const Overview = lazy(() => import('./pages/OverviewPage.jsx'))
const AlertsPage = lazy(() => import('./pages/AlertsPage.jsx'))
const AlertDetailPage = lazy(() => import('./pages/AlertDetailPage.jsx'))
const Incidents = lazy(() => import('./pages/Incidents.jsx'))
const IncidentDetail = lazy(() => import('./pages/IncidentDetail.jsx'))
const HostDetail = lazy(() => import('./pages/HostDetail.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))
const Models = lazy(() => import('./pages/Models.jsx'))
const Labeling = lazy(() => import('./pages/Labeling.jsx'))
const Suppressions = lazy(() => import('./pages/Suppressions.jsx'))
const Sensors = lazy(() => import('./pages/Sensors.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const DevComponents = lazy(() => import('./pages/DevComponents.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const fallback = <LoadingSkeleton className="mt-6" />

/** Application route table. */
export const routes = [
  {
    path: '/login',
    element: (
      <Suspense fallback={fallback}>
        <Login />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Overview /> },
          { path: 'alerts', element: <AlertsPage /> },
          { path: 'alerts/:id', element: <AlertDetailPage /> },
          { path: 'incidents', element: <Incidents /> },
          { path: 'incidents/:id', element: <IncidentDetail /> },
          { path: 'hosts/:ip', element: <HostDetail /> },
          { path: 'analytics', element: <Analytics /> },
          { path: 'models', element: <Models /> },
          { path: 'labeling', element: <Labeling /> },
          { path: 'suppressions', element: <Suppressions /> },
          { path: 'sensors', element: <Sensors /> },
          { path: 'reports', element: <Reports /> },
          { path: 'settings', element: <Settings /> },
          { path: 'dev/components', element: <DevComponents /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default router
