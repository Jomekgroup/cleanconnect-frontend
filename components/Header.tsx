import React, { useState } from 'react';
import { User, View } from '../types';

// --------------------
// Internal Icons
// --------------------
const LogoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
  </svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

interface HeaderProps {
    user: User | null;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    onNavigateToAuth: (tab: 'login' | 'signup') => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout, onNavigateToAuth }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavClick = (view: View) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo - Always Visible */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick('landing')}>
                        <LogoIcon className="h-8 w-8 text-primary" />
                        <span className="ml-2 text-xl font-bold text-dark tracking-tight">CleanConnect</span>
                    </div>

                    {/* Desktop Navigation - HIDDEN if user is logged in */}
                    {!user && (
                        <nav className="hidden md:flex items-center space-x-8">
                            <button onClick={() => handleNavClick('landing')} className="text-gray-600 hover:text-primary font-medium">Home</button>
                            <button onClick={() => handleNavClick('about')} className="text-gray-600 hover:text-primary font-medium">About</button>
                            <button onClick={() => handleNavClick('servicesPage')} className="text-gray-600 hover:text-primary font-medium">Services</button>
                            <button onClick={() => handleNavClick('contact')} className="text-gray-600 hover:text-primary font-medium">Contact</button>
                        </nav>
                    )}

                    {/* Right Side - Dynamic based on Auth */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* ✅ LOGGED IN STATE: Only Dashboard & Sign Out */}
                                <button 
                                    onClick={() => handleNavClick(user.role === 'client' ? 'clientDashboard' : 'cleanerDashboard')}
                                    className="text-primary font-bold hover:text-secondary px-4 py-2 transition-colors"
                                >
                                    Dashboard
                                </button>
                                
                                <button 
                                    onClick={onLogout}
                                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md font-medium hover:bg-red-100 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            /* ✅ LOGGED OUT STATE: Login & Signup Buttons */
                            <>
                                <button onClick={() => onNavigateToAuth('login')} className="text-gray-600 hover:text-primary font-medium px-3 py-2">Log in</button>
                                <button onClick={() => onNavigateToAuth('signup')} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors font-medium">Sign up</button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-primary p-2">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {user ? (
                            <>
                                <button onClick={() => handleNavClick(user.role === 'client' ? 'clientDashboard' : 'cleanerDashboard')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary bg-primary/5 mb-2">Dashboard</button>
                                <button onClick={onLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Sign out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleNavClick('landing')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Home</button>
                                <button onClick={() => handleNavClick('about')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">About</button>
                                <button onClick={() => handleNavClick('servicesPage')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Services</button>
                                <button onClick={() => handleNavClick('contact')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Contact</button>
                                <div className="mt-4 flex flex-col space-y-2 px-3">
                                    <button onClick={() => onNavigateToAuth('login')} className="w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium">Log in</button>
                                    <button onClick={() => onNavigateToAuth('signup')} className="w-full text-center bg-primary text-white px-4 py-2 rounded-md font-medium">Sign up</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};