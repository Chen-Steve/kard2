import { Icon } from '@iconify/react';
import { useState, useRef } from 'react';
import { ProfileDropdown } from './ProfileDropdown';

interface NavigationTabsProps {
  isOpen: boolean;
}

interface TopNavProps {
  onMenuClick: () => void;
  isOpen: boolean;
  onProfileClick: () => void;
  onAuthClick: () => void;
  isLoggedIn?: boolean;
}

export const TopNav = ({ onMenuClick, onProfileClick, onAuthClick, isLoggedIn = false }: TopNavProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;

  return (
    <>
      <div className="h-16 bg-white flex items-center relative">
        <button 
          onClick={onMenuClick}
          className="flex items-center gap-3 p-2 ml-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon 
            icon="ph:list" 
            className="w-5 h-5 text-gray-600"
          />
        </button>
        
        {/* Search bar container - responsive */}
        <div className="flex-1 mx-3 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl sm:mx-0 sm:px-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search decks..." 
              className="w-full h-10 sm:h-12 px-4 sm:px-5 pl-10 sm:pl-12 text-sm sm:text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Icon 
              icon="ph:magnifying-glass" 
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
            />
          </div>
        </div>
        
        {/* Profile button with dropdown */}
        <div className="relative flex-shrink-0 sm:ml-auto">
          <button 
            ref={profileButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <div className="relative">
              <Icon 
                icon="ph:user-circle" 
                className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 group-hover:text-blue-600 transition-colors"
              />
              {isLoggedIn && (
                <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
          </button>
          <ProfileDropdown 
            buttonRef={profileButtonRef}
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onProfileClick={() => {
              onProfileClick();
              setIsDropdownOpen(false);
            }}
            isLoggedIn={isLoggedIn}
            onAuthClick={() => {
              onAuthClick();
              setIsDropdownOpen(false);
            }}
          />
        </div>
      </div>
    </>
  );
};

export const NavigationTabs = ({ isOpen }: NavigationTabsProps) => {
  const [activeButton, setActiveButton] = useState('home');

  return (
    <nav className="px-3 whitespace-nowrap">
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => setActiveButton('home')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'home' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center min-w-[20px] justify-center">
              <Icon 
                icon="ph:house" 
                className={`w-5 h-5 ${activeButton === 'home' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
              />
            </div>
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Home</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('decks')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'decks' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center min-w-[20px] justify-center">
              <Icon 
                icon="ph:cards" 
                className={`w-5 h-5 ${activeButton === 'decks' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
              />
            </div>
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Your Decks</span>
          </button>
        </li>
        <li>
          <button className={`w-full flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group`}>
            <div className="flex items-center min-w-[20px] justify-center">
              <Icon icon="ph:plus-circle" className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300 text-blue-600 font-medium`}>
              Create
            </span>
          </button>
        </li>
        
        {/* Divider */}
        <div className="my-4 mx-3">
          <div className="h-[1px] bg-gray-200"></div>
        </div>

        <li>
          <button 
            onClick={() => setActiveButton('learn')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'learn' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center min-w-[20px] justify-center">
              <Icon 
                icon="ph:meteor" 
                className={`w-5 h-5 ${activeButton === 'learn' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
              />
            </div>
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Learn</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('test')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'test' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center min-w-[20px] justify-center">
              <Icon 
                icon="ph:exam" 
                className={`w-5 h-5 ${activeButton === 'test' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
              />
            </div>
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Test</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('matching')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'matching' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center min-w-[20px] justify-center">
              <Icon 
                icon="ph:puzzle-piece" 
                className={`w-5 h-5 ${activeButton === 'matching' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
              />
            </div>
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Matching</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('kchat')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'kchat' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center min-w-[20px] justify-center">
              <Icon 
                icon="ph:chat-circle-text" 
                className={`w-5 h-5 ${activeButton === 'kchat' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
              />
            </div>
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>K-Chat</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}; 