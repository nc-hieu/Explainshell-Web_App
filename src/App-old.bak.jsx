import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // Import router chúng ta vừa định nghĩa

function App() {
  return (
    // RouterProvider sẽ đảm nhận việc điều hướng toàn bộ ứng dụng
    <RouterProvider router={router} />
  );
}

export default App;