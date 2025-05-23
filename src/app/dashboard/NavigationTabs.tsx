import { Icon } from '@iconify/react';
import { useState } from 'react';

interface NavigationTabsProps {
  isOpen: boolean;
}

export const NavigationTabs = ({ isOpen }: NavigationTabsProps) => {
  const [activeButton, setActiveButton] = useState('home');

  return (
    <nav className="px-3 whitespace-nowrap">
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => setActiveButton('home')}
            className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'home' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon 
              icon="ph:house" 
              className={`w-5 h-5 ${activeButton === 'home' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
            />
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Home</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('decks')}
            className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'decks' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon 
              icon="ph:cards" 
              className={`w-5 h-5 ${activeButton === 'decks' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
            />
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Your Decks</span>
          </button>
        </li>
        <li>
          <button className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group`}>
            <div className="relative flex-shrink-0">
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
            className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'learn' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon 
              icon="ph:meteor" 
              className={`w-5 h-5 ${activeButton === 'learn' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
            />
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Learn</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('test')}
            className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'test' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon 
              icon="ph:exam" 
              className={`w-5 h-5 ${activeButton === 'test' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
            />
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Test</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('matching')}
            className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'matching' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon 
              icon="ph:puzzle-piece" 
              className={`w-5 h-5 ${activeButton === 'matching' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
            />
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>Matching</span>
          </button>
        </li>
        <li>
          <button 
            onClick={() => setActiveButton('kchat')}
            className={`w-full flex items-center ${isOpen ? 'justify-start' : 'justify-center'} gap-3 px-3 py-2 rounded-lg transition-colors
              ${activeButton === 'kchat' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon 
              icon="ph:chat-circle-text" 
              className={`w-5 h-5 ${activeButton === 'kchat' ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`} 
            />
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>K-Chat</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}; 