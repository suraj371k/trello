import React from 'react'
import Navbar from './Navbar'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import useAuthStore from '../store/authStore'

const Layout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  
  // Don't show navbar and footer on login/register pages if user is not authenticated
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const shouldShowLayout = user || !isAuthPage;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Always show navbar, but navbar component handles its own visibility */}
      <Navbar />
      
      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Only show footer if user is authenticated or not on auth pages */}
      {shouldShowLayout && <Footer />}
    </div>
  )
}

export default Layout