import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';

const Dashboard = Loadable(lazy(() => import('views/Dashboard')));
const AboutPage = Loadable(lazy(() => import('views/AboutPage')));
const HistoryPage = Loadable(lazy(() => import('views/History')));


// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <Dashboard/>
    },
    {
      path: '/dashboard',
      element: <Dashboard/>
    },
    { path: '/about', element: <AboutPage /> },
    { path: '/history', element: <HistoryPage /> },

  ]
};

export default MainRoutes;
