import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

const features = [
    { icon: '📱', title: 'Order Digitally', desc: 'Skip the queue with our app' },
    { icon: '🎟️', title: 'Get Your Token', desc: 'Unique token for every order' },
    { icon: '⚡', title: 'Fast Service', desc: 'Track & pick up instantly' },
    { icon: '🔒', title: 'Secure Payment', desc: 'Safe & hassle-free checkout' },
];

const popularItems = [
    { name: 'Masala Tea', price: '₹20', emoji: '🍵' },
    { name: 'Cold Coffee', price: '₹60', emoji: '🧋' },
    { name: 'Cheese Maggi', price: '₹50', emoji: '🧀' },
    { name: 'Crispy Paneer Burger', price: '₹99', emoji: '🍔' },
    { name: 'Peri Peri Fries', price: '₹90', emoji: '🍟' },
    { name: 'Paneer Momo', price: '₹99', emoji: '🥟' },
];

export default function Home() {
    const heroRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 20;
            const y = (clientY / innerHeight - 0.5) * 20;
            heroRef.current.style.setProperty('--parallax-x', `${x}px`);
            heroRef.current.style.setProperty('--parallax-y', `${y}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="home-page page-enter">
            {/* Hero Section */}
            <section className="hero" ref={heroRef}>
                <div className="hero-bg-elements">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="hero-orb hero-orb-3"></div>
                    <div className="hero-grid"></div>
                </div>

                <div className="hero-content container">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            Now accepting digital orders
                        </div>
                        <h1 className="hero-title">
                            Skip the Queue,
                            <br />
                            <span className="gradient-text">Enjoy Your Brew</span> ☕
                        </h1>
                        <p className="hero-subtitle">
                            Your favorite campus food hub — now digital. Order ahead, grab your
                            token, and skip the line at <strong>Chai Adda</strong>.
                        </p>
                        <div className="hero-actions">
                            <Link to="/menu" className="btn btn-primary btn-lg hero-cta cursor-target">
                                <span>Order Now</span>
                                <span className="cta-arrow">→</span>
                            </Link>
                            <Link to="/admin" className="btn btn-secondary btn-lg cursor-target">
                                Admin Panel
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Menu Items</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-number">5 min</span>
                                <span className="stat-label">Avg. Wait</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Digital</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="hero-emoji-cloud">
                            <span className="floating-emoji e1">☕</span>
                            <span className="floating-emoji e2">🍔</span>
                            <span className="floating-emoji e3">🍟</span>
                            <span className="floating-emoji e4">🍜</span>
                            <span className="floating-emoji e5">🥟</span>
                            <span className="floating-emoji e6">🧋</span>
                            <span className="floating-emoji e7">🌯</span>
                            <span className="floating-emoji e8">🥪</span>
                        </div>
                        <div className="hero-card glass">
                            <div className="hero-card-tag">Most Popular</div>
                            <span className="hero-card-emoji">🍵</span>
                            <h3>Masala Chai</h3>
                            <p>Freshly brewed, ₹20</p>
                        </div>
                    </motion.div>
                </div>

                <div className="hero-scroll-indicator">
                    <span>Scroll down</span>
                    <div className="scroll-arrow">↓</div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-tag">How it works</span>
                        <h2>Order in 3 Simple Steps</h2>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="feature-card glass cursor-target"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                                <div className="feature-number">{String(index + 1).padStart(2, '0')}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Items Section */}
            <section className="popular-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-tag">Fan Favorites</span>
                        <h2>Popular at Chai Adda</h2>
                    </motion.div>

                    <div className="popular-grid">
                        {popularItems.map((item, index) => (
                            <motion.div
                                key={item.name}
                                className="popular-card cursor-target"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                            >
                                <span className="popular-emoji">{item.emoji}</span>
                                <h4>{item.name}</h4>
                                <span className="popular-price">{item.price}</span>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="popular-cta"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link to="/menu" className="btn btn-primary btn-lg cursor-target">
                            View Full Menu →
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-icon">☕</span>
                            <span className="logo-text">
                                <span className="logo-chai">चाय</span> ADDA
                            </span>
                        </div>
                        <p className="footer-tagline">Your campus canteen, now digital.</p>
                        <div className="footer-divider"></div>
                        <p className="footer-copy">© 2026 Chai Adda • by Group 141</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
