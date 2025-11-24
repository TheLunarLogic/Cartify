import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BottomNav = ({ onSearchOpen }) => {
  const navigate = useNavigate();
  const [activeIcon, setActiveIcon] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleIconClick = (iconName) => {
    if (iconName === 'search') {
      setIsSearchOpen(!isSearchOpen);
      onSearchOpen();
      if (isSearchOpen) {
        navigate('/women'); // Navigate back to CustomerHome when closing search
      }
    }
    setActiveIcon(iconName);
  };

  return (
    <div className="fixed bottom-5 left-0 w-full bg-transparent flex justify-center gap-50 py-1 z-10">
      {/* Home */}
      <div className="flex flex-col items-center gap-1 cursor-pointer opacity-100 transition-opacity duration-300 active:opacity-100">
        <Link to="/women" onClick={() => handleIconClick('home')}>
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-120 transform scale-110">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ${activeIcon === 'home' ? 'scale-110' : ''}`}
            >
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke={activeIcon === 'home' ? 'none' : 'black'}
                fill={activeIcon === 'home' ? 'black' : 'none'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div
        className="flex flex-col items-center gap-1 cursor-pointer opacity-100 transition-opacity duration-300 active:opacity-100"
        onClick={() => handleIconClick('search')}
      >
        <div className={`w-11 h-11 ${isSearchOpen ? 'bg-black' : 'bg-white'} rounded-full flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-160 transform scale-150`}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-300 ${activeIcon === 'search' ? 'scale-110' : ''}`}
          >
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke={isSearchOpen ? 'white' : 'black'}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke={isSearchOpen ? 'white' : 'black'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Account */}
      <div className="flex flex-col items-center gap-1 cursor-pointer opacity-100 transition-opacity duration-300 active:opacity-100">
        <Link to="/login" onClick={() => handleIconClick('account')}>
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-120 transform scale-110">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-300 ${activeIcon === 'account' ? 'scale-110' : ''}`}
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke={activeIcon === 'account' ? 'none' : 'black'}
                fill={activeIcon === 'account' ? 'black' : 'none'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke={activeIcon === 'account' ? 'none' : 'black'}
                fill={activeIcon === 'account' ? 'black' : 'none'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;