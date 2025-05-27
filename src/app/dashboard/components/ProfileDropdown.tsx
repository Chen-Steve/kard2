import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
}

export const ProfileDropdown = ({ isOpen, onClose, onProfileClick }: ProfileDropdownProps) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Get user email from session
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email || null);
    };
    getUser();
  }, [supabase]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase">Signed in as</div>
        <div className="mt-1 text-sm font-medium text-gray-900 truncate">
          {userEmail || 'Loading...'}
        </div>
      </div>
      <div className="py-1">
        <button 
          onClick={() => {
            onProfileClick();
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <Icon icon="ph:user" className="w-4 h-4" />
          View Profile
        </button>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <Icon icon="ph:sign-out" className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}; 