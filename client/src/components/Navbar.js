"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

/**
 * Navigation Bar Component
 * Displays navigation links based on authentication status
 * Includes mobile-responsive hamburger menu
 */
const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Handle user logout
   * Logs out user and redirects to login page
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * Toggle mobile menu visibility
   */
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  /**
   * Close mobile menu when navigation link is clicked
   */
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">AI Resume Analyzer</span>
        </Link>

        {/* Mobile menu toggle button */}
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        {/* Navigation menu */}
        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          {isAuthenticated ? (
            // Authenticated user navigation
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/upload" className="nav-link" onClick={closeMenu}>
                  Upload Resume
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/history" className="nav-link" onClick={closeMenu}>
                  History
                </Link>
              </li>
              <li className="nav-item">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            // Guest user navigation
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/register"
                  className="nav-link register-link"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
