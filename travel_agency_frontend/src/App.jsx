import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Also override pushState and replaceState to trigger re-renders 
    // if other components navigate using history API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      handleLocationChange();
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  if (currentPath === '/admin' || currentPath === '/admin/') {
    return <AdminDashboard />;
  }

  return <Home />;
}

export default App;
