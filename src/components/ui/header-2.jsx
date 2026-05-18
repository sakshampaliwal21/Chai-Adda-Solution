import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const links = [
    { label: 'Menu', href: '/menu' },
    { label: 'Token', href: '/token' },
  ];

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleNav = (e, href) => {
    e.preventDefault();
    setOpen(false);
    navigate(href);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 mx-auto w-full max-w-6xl md:rounded-2xl md:border md:transition-all md:ease-out md:duration-500',
        {
          'border-[rgba(232,101,43,0.15)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] md:top-4 md:left-4 md:right-4 md:mx-auto md:max-w-5xl':
            scrolled && !open,
          'border-transparent': !scrolled && !open,
        },
      )}
      style={{
        background: scrolled && !open
          ? 'rgba(26, 22, 18, 0.75)'
          : open
            ? 'rgba(26, 22, 18, 0.95)'
            : 'rgba(26, 22, 18, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <nav
        className={cn(
          'flex h-16 w-full items-center justify-between px-6 md:h-14 md:transition-all md:ease-out',
          {
            'md:px-4': scrolled,
          },
        )}
      >
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => handleNav(e, '/')}
          className="flex items-center gap-2 cursor-pointer"
          style={{ textDecoration: 'none' }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #E8652B, #f5a623)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Chai Adda
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link, i) => (
            <a
              key={i}
              className={buttonVariants({ variant: 'ghost' })}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              style={{ color: 'var(--clr-text-secondary)', cursor: 'pointer' }}
            >
              {link.label}
            </a>
          ))}
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <a
                  className={buttonVariants({ variant: 'ghost' })}
                  href="/admin"
                  onClick={(e) => handleNav(e, '/admin')}
                  style={{ color: 'var(--clr-text-secondary)', cursor: 'pointer' }}
                >
                  Admin
                </a>
              )}
              <Button
                variant="outline"
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  borderColor: 'rgba(232, 101, 43, 0.3)',
                  color: 'var(--clr-primary-light)',
                  background: 'transparent',
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                style={{
                  borderColor: 'rgba(232, 101, 43, 0.3)',
                  color: 'var(--clr-primary-light)',
                  background: 'transparent',
                }}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                style={{
                  background: 'linear-gradient(135deg, #E8652B, #f5a623)',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden"
          style={{
            borderColor: 'rgba(232, 101, 43, 0.3)',
            color: 'var(--clr-primary-light)',
            background: 'transparent',
          }}
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden md:hidden',
          open ? 'block' : 'hidden',
        )}
        style={{
          background: 'rgba(26, 22, 18, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(232, 101, 43, 0.1)',
        }}
      >
        <div className="flex h-full w-full flex-col justify-between gap-y-2 p-6">
          <div className="grid gap-y-1">
            {links.map((link) => (
              <a
                key={link.label}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'justify-start text-lg',
                })}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                style={{ color: 'var(--clr-text-secondary)', cursor: 'pointer' }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setOpen(false); logout(); navigate('/'); }}
                style={{
                  borderColor: 'rgba(232, 101, 43, 0.3)',
                  color: 'var(--clr-primary-light)',
                  background: 'transparent',
                }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setOpen(false); navigate('/login'); }}
                  style={{
                    borderColor: 'rgba(232, 101, 43, 0.3)',
                    color: 'var(--clr-primary-light)',
                    background: 'transparent',
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  onClick={() => { setOpen(false); navigate('/signup'); }}
                  style={{
                    background: 'linear-gradient(135deg, #E8652B, #f5a623)',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
