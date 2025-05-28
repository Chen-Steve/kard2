import { Icon } from '@iconify/react';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onAuthClick: () => void;
  isLoggedIn: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export const ProfileDropdown = ({ isOpen, onClose, onProfileClick, onAuthClick, isLoggedIn, buttonRef }: ProfileDropdownProps) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  useEffect(() => {
    // Get user email from session only if logged in
    if (isLoggedIn) {
      const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUserEmail(session?.user?.email || null);
      };
      getUser();
    }
  }, [supabase, isLoggedIn]);

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} className="absolute right-0 mt-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
      {isLoggedIn ? (
        <>
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase">Signed in as</div>
            <div className="mt-1 text-sm font-medium text-gray-900 truncate">
              {userEmail || 'Loading...'}
            </div>
          </div>
          <div>
            <button 
              onClick={() => {
                onProfileClick();
                onClose();
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 border-b border-gray-100"
            >
              <Icon icon="ph:user" className="w-4 h-4" />
              View Profile
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                onClose();
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Icon icon="ph:sign-out" className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </>
      ) : (
        <div>
          <button 
            onClick={() => {
              onAuthClick();
              onClose();
            }}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Icon icon="ph:sign-in" className="w-4 h-4" />
            Sign up / Login
          </button>
        </div>
      )}
    </div>
  );
}; 