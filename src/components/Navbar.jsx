import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
    const { totalItems } = useCart();
    const location = useLocation();
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
        { path: '/admin', label: 'Admin', icon: '📊' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-inner container">
                <Link to="/" className="navbar-logo cursor-target">
                    <span className="logo-icon">☕</span>
                    <span className="logo-text">
                        <span className="logo-chai">चाय</span> ADDA
                    </span>
                </Link>

                <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link cursor-target ${location.pathname === link.path ? 'active' : ''}`}
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
