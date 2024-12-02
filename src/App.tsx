import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { MainPage } from './pages/main/index';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />
  }
]);

export const App = () => <RouterProvider router={router} />;
