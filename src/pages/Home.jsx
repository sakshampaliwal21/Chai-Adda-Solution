import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import SpotlightCard from '../components/SpotlightCard';
import BlurText from '../components/BlurText';
import CurvedLoop from '../components/CurvedLoop';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
        ),
        title: 'Order Digitally',
        desc: 'Skip the queue with our app'
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
            </svg>
        ),
        title: 'Get Your Token',
        desc: 'Unique token for every order'
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
        ),
        title: 'Fast Service',
        desc: 'Track & pick up instantly'
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>
            </svg>
        ),
        title: 'Secure Payment',
        desc: 'Safe & hassle-free checkout'
    },
];

const popularItems = [
    { id: 'b1', name: 'Masala Tea', price: 20, emoji: '🍵' },
    { id: 'b2', name: 'Cold Coffee', price: 60, emoji: '🧋' },
    { id: 'm1', name: 'Cheese Maggi', price: 50, emoji: '🧀' },
    { id: 's2', name: 'Paneer Burger', price: 99, emoji: '🍔' },
    { id: 's3', name: 'Peri Peri Fries', price: 90, emoji: '🍟' },
    { id: 'f2', name: 'Paneer Momo', price: 99, emoji: '🥟' },
];


export default function Home() {
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const popularRef = useRef(null);
    const { isAuthenticated, user, getRecommendations, toggleFavoriteItem } = useAuth();
    const { setCart } = useCart();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Framer Motion scroll-linked parallax for hero
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

    const handleQuickReorder = (items) => {
        setCart(items);
        addToast('Favorite added to cart!', 'success');
        navigate('/cart');
    };

    const recommendations = isAuthenticated ? getRecommendations() : [];
    const displayItems = recommendations.length >= 3 ? recommendations.slice(0, 6) : popularItems;
    const isShowingPersonalized = recommendations.length >= 3;
    const favorites = isAuthenticated && user?.favorites ? user.favorites : [];

    // Mouse parallax for hero orbs
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX / innerWidth - 0.5) * 30;
            const y = (clientY / innerHeight - 0.5) * 30;
            heroRef.current.style.setProperty('--parallax-x', `${x}px`);
            heroRef.current.style.setProperty('--parallax-y', `${y}px`);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // GSAP scroll-triggered animations for features & popular sections
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Feature cards — staggered zoom-in reveal
            if (featuresRef.current) {
                const cards = featuresRef.current.querySelectorAll('.feature-card');
                gsap.fromTo(cards, {
                    opacity: 0,
                    scale: 0.85,
                    y: 60,
                    rotateX: 8,
                }, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: 'top 80%',
                        once: true,
                    }
                });
            }

            // Popular cards — scale + fade from different directions
            if (popularRef.current) {
                const cards = popularRef.current.querySelectorAll('.popular-card-motion-wrapper');
                gsap.fromTo(cards, {
                    opacity: 0,
                    scale: 0.8,
                    y: 40,
                }, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'back.out(1.4)',
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: popularRef.current,
                        start: 'top 80%',
                        once: true,
                    }
                });
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="home-page page-enter">
            {/* Hero Section — parallax layered */}
            <motion.section
                className="hero"
                ref={heroRef}
                style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            >
                <div className="hero-bg-elements">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="hero-orb hero-orb-3"></div>
                    <div className="hero-grid"></div>
                </div>

                <div className="hero-content container">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <motion.div
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <span className="badge-dot"></span>
                            Now accepting digital orders
                        </motion.div>

                        <h1 className="hero-title" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <BlurText
                                text="Skip the queue"
                                delay={120}
                                animateBy="words"
                                direction="top"
                                stepDuration={0.5}
                            />
                            <BlurText
                                text="Enjoy your brew ☕"
                                delay={120}
                                animateBy="words"
                                direction="top"
                                stepDuration={0.5}
                            />
                        </h1>

                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            Your favorite campus food hub — now digital. Order ahead, grab your
                            token, and skip the line at <strong>Chai Adda</strong>.
                        </motion.p>

                        <motion.div
                            className="hero-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                        >
                            <Link to="/menu" className="btn btn-primary btn-lg hero-cta cursor-target">
                                <span>Order Now</span>
                                <span className="cta-arrow">→</span>
                            </Link>
                            <Link to="/admin" className="btn btn-secondary btn-lg cursor-target">
                                Admin Panel
                            </Link>
                        </motion.div>

                        <motion.div
                            className="hero-stats"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.2 }}
                        >
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
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.7, rotateY: -10 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <div className="hero-emoji-cloud">
                            <span className="floating-emoji e1">☕</span>
                            <span className="floating-emoji e2">🍔</span>
                            <span className="floating-emoji e3">🍟</span>
                            <span className="floating-emoji e4">🧆</span>
                            <span className="floating-emoji e5">🧀</span>
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
            </motion.section>

            {/* Infinite Marquee Band */}
            <div className="marquee-section" style={{ overflowX: 'hidden', padding: '1rem 0' }}>
                <CurvedLoop 
                    marqueeText="🍵 Masala Tea        🧋 Cold Coffee        🍔 Burgers        🥟 Momos        🍟 Fries        🧀 Maggi        🌯 Wraps        🥪 Sandwiches        ☕ Espresso        🥤 Shakes        🧆 Veg Nuggets        "
                    speed={0.8}
                    curveAmount={175}
                    direction="left"
                    interactive
                    className="curved-text-style"
                />
            </div>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="section-tag">How it works</span>
                    </motion.div>

                    <div className="features-grid" ref={featuresRef}>
                        {features.map((feature, index) => (
                            <SpotlightCard
                                key={feature.title}
                                className="feature-card cursor-target"
                                spotlightColor="rgba(232, 101, 43, 0.4)"
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                                <div className="feature-number">{String(index + 1).padStart(2, '0')}</div>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Items Section */}
            <section className="popular-section">
                <div className="container">
                    {favorites.length > 0 && (
                        <motion.div
                            className="quick-reorder-banner glass-strong"
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                            style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
                        >
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--clr-accent)', fontSize: '1.5rem' }}>Quick Reorder</h3>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', color: 'var(--clr-text-secondary)' }}>Grab your usual: <strong>{favorites[0].name}</strong></p>
                            </div>
                            <button className="btn btn-primary cursor-target" onClick={() => handleQuickReorder(favorites[0].items)}>
                                Reorder Now
                            </button>
                        </motion.div>
                    )}

                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="section-tag">{isShowingPersonalized ? 'Just For You' : 'Fan Favorites'}</span>
                        <h2 style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <BlurText
                                text={isShowingPersonalized ? 'Recommended Based on Your Orders' : 'Popular at Chai Adda'}
                                delay={100}
                                animateBy="words"
                                direction="bottom"
                            />
                        </h2>
                    </motion.div>

                    <div className="popular-grid" ref={popularRef}>
                        {displayItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                className="popular-card-motion-wrapper"
                                whileHover={{
                                    scale: 1.06,
                                    y: -6,
                                    transition: { duration: 0.35, ease: 'easeOut' }
                                }}
                                style={{ position: 'relative', height: '100%' }}
                            >
                                <SpotlightCard className="popular-card cursor-target" spotlightColor="rgba(232, 101, 43, 0.2)">
                                    {isAuthenticated && (
                                        <button
                                            className="favorite-item-btn cursor-target"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavoriteItem(item);
                                                addToast((user?.favoriteItems || []).some(i => i.id === item.id) ? 'Removed from favorites' : 'Added to favorites', 'success');
                                            }}
                                            style={{
                                                position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                                                background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
                                                width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer',
                                                color: (user?.favoriteItems || []).some(i => i.id === item.id) ? 'gold' : 'rgba(255,255,255,0.7)',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        >
                                            {(user?.favoriteItems || []).some(i => i.id === item.id) ? '★' : '☆'}
                                        </button>
                                    )}
                                    <span className="popular-emoji">{item.emoji}</span>
                                    <h4>{item.name}</h4>
                                    <span className="popular-price">₹{item.price}</span>
                                </SpotlightCard>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="popular-cta"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6 }}
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
