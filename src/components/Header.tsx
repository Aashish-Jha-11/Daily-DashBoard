
import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl md:text-3xl font-bold">Good<span className="text-primary">Morning</span></h1>
      <div className="flex items-center gap-4">
        {!loading && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAuthAction}
          >
            {user ? (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};
