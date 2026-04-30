import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import Layouts
import AdminLayout from '../components/layout/AdminLayout';
import PublicLayout from '../components/layout/PublicLayout';

// Import Public Pages
import Home from '../pages/public/Home';
import SearchResults from '../pages/public/SearchResults';
import ProgramDetails from '../pages/public/ProgramDetails';
import CategoriesPage from '../pages/public/Categories';
import CategoryDetails from '../pages/public/Categories/CategoryDetails';
import AuthPage from '../pages/public/AuthPage'; 
import Profile from '../pages/public/Profile';  

// Import Admin Pages
import Login from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import Programs from '../pages/admin/Programs';
import Categories from '../pages/admin/Categories';
import Options from '../pages/admin/Options';


import NotFound from '../pages/NotFound'
import AdminProtectedRoute from '../components/common/AdminProtectedRoute';

const router = createBrowserRouter([
  // --- KHU VỰC PUBLIC ---
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true, // Trang chủ mặc định
        element: <Home />,
      },
      {
        path: 'search', // Đường dẫn: /explain?cmd=...
        element: <SearchResults />,
      },
      {
        path: 'programs/:slug',
        element: <ProgramDetails />,
      },
      { 
        path: 'categories', 
        element: <CategoriesPage /> 
      },
      { 
        path: 'categories/:slug', 
        element: <CategoryDetails /> 
      },
      { 
        path: 'auth', element: <AuthPage /> 
      },
      { 
        path: 'profile', element: <Profile /> 
      },
    ]
  },

  // --- KHU VỰC ADMIN ---
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'programs', element: <Programs /> },
          { path: 'options', element: <Options /> },
          { path: 'categories', element: <Categories /> },
          { index: true, element: <Navigate to="/admin/dashboard" replace /> }
        ],
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;