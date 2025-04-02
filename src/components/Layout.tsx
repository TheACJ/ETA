import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'; // Add Outlet
import { Dialog, Menu, Transition } from '@headlessui/react';
import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

interface NavLink {
  href: string;
  label: string;
  roles: Array<'admin' | 'staff' | 'student'>;
}

interface AdminLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', roles: ['admin', 'staff', 'student'] },
  { href: '/exams', label: 'Exams', roles: ['student'] },
  { href: '/exam-management', label: 'Exam Management', roles: ['staff', 'admin'] },
  { href: '/question-bank', label: 'Question Bank', roles: ['staff', 'admin'] },
];

const adminLinks: AdminLink[] = [
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/staff', label: 'Staff' },
  { href: '/admin/term-session', label: 'Term/Session' },
];

interface LayoutProps {
  children?: React.ReactNode; // Optional since Outlet will handle nested routes
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isActive = (path: string): boolean => location.pathname === path;

  const navLinkClasses = (path: string): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark ${
      isActive(path)
        ? 'text-primary-dark underline underline-offset-4 decoration-2'
        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
    }`;

  const mobileNavLinkClasses = (path: string): string =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out ${
      isActive(path)
        ? 'bg-primary-light text-primary-dark'
        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
    }`;

  const filteredNavLinks = navLinks.filter((link) =>
    user ? link.roles.includes(user.role) : link.roles.includes('student')
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-md' : 'bg-white'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex flex-shrink-0 items-center" onClick={closeMobileMenu}>
                <img src={logo} alt="The ACJ - ETA Logo" className="h-10 w-auto" />
                <h1 className="font-kalam text-xl sm:text-2xl font-semibold ml-3 text-gray-900">
                  The ACJ - ETA
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {filteredNavLinks.map((link) => (
                <Link key={link.href} to={link.href} className={navLinkClasses(link.href)}>
                  {link.label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Menu as="div" className="relative">
                  <Menu.Button className={`inline-flex items-center ${navLinkClasses('/admin')} group`}>
                    <span>Admin Menu</span>
                    <ChevronDown
                      className="ml-1 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {adminLinks.map((link) => (
                        <Menu.Item key={link.href}>
                          {({ active }: { active: boolean }) => (
                            <Link
                              to={link.href}
                              className={`block px-4 py-2 text-sm ${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              } ${isActive(link.href) ? 'font-semibold text-primary-dark' : ''}`}
                            >
                              {link.label}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
              {user && (
                <button onClick={handleLogout} className={navLinkClasses('/logout')}>
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-dark"
                aria-label="Open main menu"
              >
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <Transition.Root show={isMobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 md:hidden" onClose={setIsMobileMenuOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 z-40 flex justify-end">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
                  <div className="flex px-4 pt-5 pb-2 justify-end">
                    <button
                      type="button"
                      className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-primary hover:bg-gray-100"
                      onClick={closeMobileMenu}
                      aria-label="Close menu"
                    >
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="space-y-1 border-t border-gray-200 px-4 py-6">
                    {filteredNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={mobileNavLinkClasses(link.href)}
                        onClick={closeMobileMenu}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="space-y-1 border-t border-gray-200 px-4 py-6">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Admin Area</h3>
                      {adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={mobileNavLinkClasses(link.href)}
                          onClick={closeMobileMenu}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  {user && (
                    <div className="space-y-1 border-t border-gray-200 px-4 py-6">
                      <button
                        onClick={handleLogout}
                        className={mobileNavLinkClasses('/logout')}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet /> {/* Render nested routes here */}
          {children} {/* Render any direct children (optional) */}
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 py-4 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>© {new Date().getFullYear()} The ACJ - ETA. All rights reserved.</p>
          <p className="mt-1">Onitsha, Delta State, Nigeria</p>
        </div>
      </footer>
    </div>
  );
}