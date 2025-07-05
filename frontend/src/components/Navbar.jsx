import React from "react";
import { Home, LogOut } from "lucide-react";
import useAuthStore from "../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const shouldShowNavbar = user || !isAuthPage;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!shouldShowNavbar) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-2 md:space-x-8">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleHomeClick}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900 hidden sm:block">
                TrelloClone
              </span>
            </div>

            {/* Navigation Links - Show on all screens if user is authenticated */}
            {user && (
              <div className="flex items-center space-x-2 md:space-x-6">
                <button
                  onClick={handleHomeClick}
                  className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:block">Home</span>
                </button>
              </div>
            )}
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2 md:space-x-3">
                {/* User Avatar - Show on all screens */}
                <div className="flex items-center space-x-2 md:space-x-3 bg-gray-50 rounded-lg px-2 md:px-3 py-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs md:text-sm">
                      {getInitials(user.username)}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Logout Button - Show on all screens */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block text-sm font-medium">
                    Logout
                  </span>
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <div className="flex items-center space-x-2 md:space-x-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm md:text-base"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm md:text-base"
                  >
                    Register
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>


    </nav>
  );
};

export default Navbar;