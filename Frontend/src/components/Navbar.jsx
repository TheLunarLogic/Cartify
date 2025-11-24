import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Menu, X, Bot } from 'lucide-react';

const Navbar = ({ cartItemsCount, onChatToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Disable website scroll on component mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Disable scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'hidden'; // Keep scroll disabled even when menu is closed
    }
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-transparent">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl md:text-2xl font-bold tracking-wider text-gray-800 no-underline hover:text-black">
                Cartify
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex space-x-20">
                <NavLink
                  to="/women"
                  className={({ isActive }) =>
                    `px-3 py-2 text-lg font-bold ${
                      isActive ? 'text-black border-b-2 border-black' : 'text-gray-800 hover:text-black'
                    }`
                  }
                >
                  Women
                </NavLink>
                <NavLink
                  to="/men"
                  className={({ isActive }) =>
                    `px-3 py-2 text-lg font-bold ${
                      isActive ? 'text-black border-b-2 border-black' : 'text-gray-800 hover:text-black'
                    }`
                  }
                >
                  Men
                </NavLink>
                <NavLink
                  to="/kids"
                  className={({ isActive }) =>
                    `px-3 py-2 text-lg font-bold ${
                      isActive ? 'text-black border-b-2 border-black' : 'text-gray-800 hover:text-black'
                    }`
                  }
                >
                  Kids
                </NavLink>
                <NavLink
                  to="/baby"
                  className={({ isActive }) =>
                    `px-3 py-2 text-lg font-bold ${
                      isActive ? 'text-black border-b-2 border-black' : 'text-gray-800 hover:text-black'
                    }`
                  }
                >
                  Baby
                </NavLink>
              </div>
            </div>

            {/* Cart and Chatbot Icons */}
            <div className="flex items-center space-x-4">
              <NavLink
                to="/cart"
                className="text-gray-800 hover:text-black p-2 relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </NavLink>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden ml-2 p-2 text-white hover:text-gray-200"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/80 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <NavLink
                  to="/women"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-white bg-black/50' : 'text-gray-300 hover:text-white hover:bg-black/30'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Women
                </NavLink>
                <NavLink
                  to="/men"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-white bg-black/50' : 'text-gray-300 hover:text-white hover:bg-black/30'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Men
                </NavLink>
                <NavLink
                  to="/kids"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-white bg-black/50' : 'text-gray-300 hover:text-white hover:bg-black/30'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kids
                </NavLink>
                <NavLink
                  to="/baby"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-white bg-black/50' : 'text-gray-300 hover:text-white hover:bg-black/30'
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Baby
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Floating Chatbot Button */}
      <button
        onClick={onChatToggle}
        className="fixed bottom-6 right-6 text-white hover:text-gray-200 p-4 rounded-full bg-black/80 shadow-lg z-50 group cursor-pointer"
        aria-label="Open chat"
      >
        <Bot className="w-6 h-6" />
        <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-[spin_3s_linear_infinite]"></div>
      </button>
    </>
  );
};

export default Navbar;