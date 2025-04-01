import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png'; // Assuming logo path is correct

// Define Navigation Links Structure
interface NavLink {
  href: string;
  label: string;
}

interface AdminLink extends NavLink {}

const mainNavLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/questionbank', label: 'Question Bank' },
];

const adminNavLinks: AdminLink[] = [
  { href: '/students', label: 'Students' },
  { href: '/staff', label: 'Staff' },
  { href: '/term-session', label: 'Term/Session/Subject' },
];

// Layout Component Props
interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const location = useLocation(); // Hook to get current path

  // Handle scroll effect for header background/shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Helper function to determine active link
  const isActive = (path: string): boolean => location.pathname === path;

  // Base classes for nav links + active/inactive states
  const navLinkClasses = (path: string): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark ${
      isActive(path)
        ? 'text-primary-dark underline underline-offset-4 decoration-2' // Style for active link
        : 'text-gray-700 hover:text-primary hover:bg-gray-100' // Style for inactive link
    }`;

  const mobileNavLinkClasses = (path: string): string =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out ${
      isActive(path)
        ? 'bg-primary-light text-primary-dark' // Style for active mobile link
        : 'text-gray-700 hover:text-primary hover:bg-gray-100' // Style for inactive mobile link
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Added flex context */}
      {/* ========== Header ========== */}
      <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-md' : 'bg-white'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex flex-shrink-0 items-center" onClick={closeMobileMenu}>
                <img src={logo} alt="The ACJ - ETA Logo" className="h-10 w-auto" /> {/* Slightly smaller logo */}
                <h1 className="font-kalam text-xl sm:text-2xl font-semibold ml-3 text-gray-900"> {/* Adjusted size/weight */}
                  The ACJ - ETA
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {mainNavLinks.map((link) => (
                <Link key={link.href} to={link.href} className={navLinkClasses(link.href)}>
                  {link.label}
                </Link>
              ))}

              {/* Admin Dropdown Menu (Headless UI) */}
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className={`inline-flex items-center ${navLinkClasses('/admin')} group`}> {/* Reuse navLink style logic for button appearance */}
                    <span>Admin Menu</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" aria-hidden="true" />
                  </Menu.Button>
                </div>
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
                    {adminNavLinks.map((link) => (
                      <Menu.Item key={link.href}>
                        {({ active }) => (
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

              {/* Logout Link */}
              <Link to="/logout" className={navLinkClasses('/logout')}> {/* Apply consistent styling */}
                Logout
              </Link>
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

        {/* ========== Mobile Menu (Headless UI Dialog) ========== */}
        <Transition.Root show={isMobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 md:hidden" onClose={setIsMobileMenuOpen}>
            {/* Overlay */}
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

            {/* Menu Panel */}
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
                  {/* Close Button */}
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

                  {/* Mobile Links */}
                  <div className="space-y-1 border-t border-gray-200 px-4 py-6">
                    {mainNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={mobileNavLinkClasses(link.href)}
                        onClick={closeMobileMenu} // Close menu on navigation
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Admin Links Section */}
                  <div className="space-y-1 border-t border-gray-200 px-4 py-6">
                     <h3 className="text-sm font-semibold text-gray-500 mb-2">Admin Area</h3>
                     {adminNavLinks.map((link) => (
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

                  {/* Mobile Logout */}
                  <div className="space-y-1 border-t border-gray-200 px-4 py-6">
                     <Link
                       to="/logout"
                       className={mobileNavLinkClasses('/logout')}
                       onClick={closeMobileMenu}
                     >
                       Logout
                     </Link>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </header>

      {/* ========== Main Content ========== */}
      <main className="flex-grow"> {/* Added flex-grow */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"> {/* Consistent padding */}
          {/* Removed extra nested divs, direct child rendering */}
          {children}
        </div>
      </main>

      {/* ========== Footer ========== */}
      <footer className="bg-gray-800 text-gray-300 py-4 mt-8"> {/* Adjusted colors */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} The ACJ - ETA. All rights reserved.</p>
           <p className="mt-1">Onitsha, Delta State, Nigeria</p> {/* Added location based on context */}
        </div>
      </footer>
    </div>
  );
}