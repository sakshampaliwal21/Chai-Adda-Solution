import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { totalItems } = useCart();
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const navLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/menu', label: 'Menu', icon: '📜' },
        { path: '/cart', label: 'Cart', icon: '🛒' },
        { path: '/party-order', label: 'Party Order', icon: '🎉' },
        { path: '/admin', label: 'Admin', icon: '' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-inner container">
                <Link to="/" className="navbar-logo cursor-target" onClick={() => setMobileOpen(false)} style={{ zIndex: 50 }}>
                    <span className="logo-icon">☕</span>
                    <span className="logo-text">
                        <span className="logo-chai">चाय</span> ADDA
                    </span>
                </Link>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    <div className="nav-links-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link cursor-target ${location.pathname === link.path ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className="nav-icon">{link.icon}</span>
                                <span>{link.label}</span>
                                {link.path === '/cart' && totalItems > 0 && (
                                    <motion.span
                                        className="badge cart-badge"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        key={totalItems}
                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="nav-auth-section">
                        {isAuthenticated ? (
                            <div className="nav-user-section">
                                <Link to="/profile" className="nav-user-info cursor-target" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none' }}>
                                    <span className="nav-user-avatar">{user.avatar}</span>
                                    <span className="nav-user-name">{user.name?.split(' ')[0]}</span>
                                </Link>
                                <button
                                    className="nav-logout-btn cursor-target"
                                    onClick={handleLogout}
                                    title="Logout"
                                >
                                    ↗
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                onClick={() => setMobileOpen(false)}
                                className={`nav-link nav-login-link cursor-target ${location.pathname === '/auth' ? 'active' : ''}`}
                            >
                                <span className="nav-icon">👤</span>
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>

                <button
                    className="mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>
        </nav>
    );
}

