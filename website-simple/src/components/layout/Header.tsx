import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

/**
 * Header component for the application
 * Layout:
 * ┌────────────────────────────────────┐
 * │ ResiWash          [☀️/🌙] [Admin] │
 * └────────────────────────────────────┘
 */
export function Header({ className }: HeaderProps) {
  const { currentUser } = useAuth();
  const isAdminPage = window.location.pathname.includes('/admin');

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b backdrop-blur',
        className
      )}
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: 'rgba(var(--bg-rgb, 10, 10, 10), 0.95)',
      }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => handleNavigate('/')}
          className="text-xl font-bold text-primary hover:text-accent transition-colors"
        >
          ResiWash
        </button>

        {/* Right side: Theme switcher + Admin link */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {currentUser && !isAdminPage && (
            <Button variant="outline" size="sm" onClick={() => handleNavigate('/admin')}>
              Admin
            </Button>
          )}
          {isAdminPage && (
            <Button variant="outline" size="sm" onClick={() => handleNavigate('/')}>
              Home
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
