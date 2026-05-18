import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import Layouts
import AdminLayout from '../components/layout/AdminLayout';
import PublicLayout from '../components/layout/PublicLayout';

// Import Public Pages
import Home from '../pages/public/Home';
import SearchResults from '../pages/public/SearchResults';
import AuthPage from '../pages/public/AuthPage'; 
import Profile from '../pages/public/Profile';  

// --- CÁC TRANG HIỂN THỊ DỮ LIỆU PUBLIC ---
import TopicsPage from '../pages/public/Topics'; 
import TopicDetails from '../pages/public/Topics/TopicDetails';
import CategoryDetails from '../pages/public/Categories/CategoryDetails';
import ProgramDetails from '../pages/public/ProgramDetails';

// Import Admin Pages
import Login from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import Programs from '../pages/admin/Programs';
import Categories from '../pages/admin/Categories';
// import Options from '../pages/admin/Options';
import Topics from '../pages/admin/Topics';


import NotFound from '../pages/NotFound';
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
        path: 'search', // Đường dẫn: /search?cmd=...
        element: <SearchResults />,
      },
      
      // 1. Trang danh sách các Topics
      { 
        path: 'topics', 
        element: <TopicsPage /> 
      },
      
      // 2. Trang chi tiết Topic (Hiển thị các Category Cha) -> VD: /linux/categories
      { 
        path: ':topic_slug/categories', 
        element: <TopicDetails /> 
      },
      
      // 3. Trang chi tiết Category (Hiển thị Category Con & Lệnh) -> VD: /linux/categories/network
      { 
        path: ':topic_slug/categories/:category_slug', 
        element: <CategoryDetails /> 
      },
      
      // 4. Trang chi tiết Lệnh -> VD: /linux/programs/tar
      {
        path: '/programs/:program_slug',
        element: <ProgramDetails />,
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
    path: '/nchieu-adm-exsh/login',
    element: <Login />,
  },
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: '/nchieu-adm-exsh',
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'programs', element: <Programs /> },
          // { path: 'options', element: <Options /> },
          { path: 'categories', element: <Categories /> },
          { path: 'topics', element: <Topics /> },
          { index: true, element: <Navigate to="/nchieu-adm-exsh/dashboard" replace /> }
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