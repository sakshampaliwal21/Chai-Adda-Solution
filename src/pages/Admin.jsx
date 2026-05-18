import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { useStock } from '../context/StockContext';
import BorderGlow from '../components/BorderGlow';
import StockManagement from './StockManagement';
import AdminDashboard from './AdminDashboard';
import './Admin.css';

const statusConfig = {
    received: { label: 'Received', icon: '🟡', color: 'var(--clr-received)', next: 'preparing' },
    preparing: { label: 'Preparing', icon: '🟠', color: 'var(--clr-preparing)', next: 'serving' },
    serving: { label: 'Serving', icon: '🟢', color: 'var(--clr-serving)', next: null },
};

export default function Admin() {
    const { orders, updateOrderStatus, removeOrder } = useOrders();
    const { addToast } = useToast();
    const { outOfStockItems } = useStock();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('orders');

    // 3D tilt refs (same as Auth page)
    const cardRef = useRef(null);
    const shineRef = useRef(null);
    const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, shineX: 50, shineY: 50 });
    const rafRef = useRef(null);

    // Smooth 60fps tilt animation loop
    const animateTilt = useCallback(() => {
        const t = tiltRef.current;
        const lerp = 0.08;
        t.x += (t.targetX - t.x) * lerp;
        t.y += (t.targetY - t.y) * lerp;

        if (cardRef.current) {
            cardRef.current.style.transform =
                `perspective(1000px) rotateX(${t.y}deg) rotateY(${t.x}deg) scale3d(1.01, 1.01, 1.01)`;
        }
        if (shineRef.current) {
            shineRef.current.style.background =
                `radial-gradient(circle at ${t.shineX}% ${t.shineY}%, rgba(232,101,43,0.18), transparent 60%)`;
        }

        rafRef.current = requestAnimationFrame(animateTilt);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            rafRef.current = requestAnimationFrame(animateTilt);
            return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
        }
    }, [animateTilt, isAuthenticated]);

    const handleCardMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);
        tiltRef.current.targetX = x * 3;
        tiltRef.current.targetY = y * -3;
        tiltRef.current.shineX = ((e.clientX - rect.left) / rect.width) * 100;
        tiltRef.current.shineY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    const handleCardMouseLeave = () => {
        tiltRef.current.targetX = 0;
        tiltRef.current.targetY = 0;
        tiltRef.current.shineX = 50;
        tiltRef.current.shineY = 50;
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            addToast('Welcome, Admin!', 'success');
        } else {
            setLoginError('Invalid password');
            setTimeout(() => setLoginError(''), 3000);
        }
    };

    const handleStatusUpdate = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
        addToast(`Order status updated to ${statusConfig[newStatus].label}`, 'success');
    };

    const handleComplete = (orderId) => {
        removeOrder(orderId);
        addToast('Order completed and removed', 'info');
    };

    const filteredOrders = filter === 'all'
        ? orders
        : filter === 'scheduled'
            ? orders.filter((o) => o.scheduleInfo?.isPartyOrder)
            : orders.filter((o) => o.status === filter);

    const counts = {
        total: orders.length + 142,
        received: orders.filter((o) => o.status === 'received').length,
        preparing: orders.filter((o) => o.status === 'preparing').length,
        serving: orders.filter((o) => o.status === 'serving').length,
        scheduled: orders.filter((o) => o.scheduleInfo?.isPartyOrder).length,
    };

    // Login gate
    if (!isAuthenticated) {
        return (
            <div className="admin-page page-enter">
                {/* Floating Particles */}
                <div className="auth-particles">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="auth-particle"
                            style={{
                                '--delay': `${Math.random() * 5}s`,
                                '--duration': `${8 + Math.random() * 12}s`,
                                '--x-start': `${Math.random() * 100}%`,
                                '--y-start': `${Math.random() * 100}%`,
                                '--size': `${3 + Math.random() * 6}px`,
                                '--opacity': `${0.1 + Math.random() * 0.3}`,
                            }}
                        />
                    ))}
                </div>

                {/* Glowing Orbs */}
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />

                <div
                    className="container admin-login-container"
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                >
                    <motion.div
                        className="auth-card-3d admin-login"
                        ref={cardRef}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20, duration: 0.8 }}
                    >
                        {/* Card Shine Effect */}
                        <div className="card-shine" ref={shineRef} />

                        <BorderGlow
                            className="auth-border-glow"
                            glowColor="20 85 55"
                            backgroundColor="rgba(30, 25, 21, 0.92)"
                            borderRadius={20}
                            glowRadius={35}
                            glowIntensity={1.2}
                            coneSpread={30}
                            edgeSensitivity={25}
                            colors={['#e8652b', '#f5a623', '#c4481a']}
                            fillOpacity={0.4}
                        >
                        <div className="auth-card-inner admin-login-inner">
                            <div className="login-icon">🔐</div>
                            <h1>Admin Access</h1>
                            <p>Enter password to manage orders</p>
                            <form onSubmit={handleLogin} className="login-form">
                                <div className="input-group">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter admin password"
                                        className="admin-input"
                                        autoFocus
                                    />
                                </div>
                                {loginError && (
                                    <motion.p
                                        className="login-error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {loginError}
                                    </motion.p>
                                )}
                                <button type="submit" className="btn btn-primary btn-lg login-btn cursor-target">
                                    Login →
                                </button>
                            </form>
                        </div>
                        </BorderGlow>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page page-enter">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="admin-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Manage orders and inventory</p>
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsAuthenticated(false)}
                    >
                        Logout
                    </button>
                </motion.div>

                {/* Admin Tabs */}
                <motion.div
                    className="admin-tabs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <button
                        className={`admin-tab cursor-target ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <span className="admin-tab-icon">🍽️</span>
                        <span>Orders</span>
                        {orders.length > 0 && (
                            <span className="admin-tab-badge">{orders.length}</span>
                        )}
                    </button>
                    <button
                        className={`admin-tab cursor-target ${activeTab === 'stock' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stock')}
                    >
                        <span className="admin-tab-icon">📦</span>
                        <span>Stock</span>
                        {outOfStockItems.length > 0 && (
                            <span className="admin-tab-badge danger">{outOfStockItems.length}</span>
                        )}
                    </button>
                    <button
                        className={`admin-tab cursor-target ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <span className="admin-tab-icon">📊</span>
                        <span>Dashboard</span>
                    </button>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'orders' ? (
                        <motion.div
                            key="orders"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Stats */}
                            <motion.div
                                className="admin-stats"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="stat-card glass">
                                    <span className="stat-icon">📦</span>
                                    <div className="stat-data">
                                        <span className="stat-num">{counts.total}</span>
                                        <span className="stat-lbl">Total Orders</span>
                                    </div>
                                </div>
                                <div className="stat-card glass" style={{ borderTopColor: 'var(--clr-received)' }}>
                                    <span className="stat-icon">🟡</span>
                                    <div className="stat-data">
                                        <span className="stat-num">{counts.received}</span>
                                        <span className="stat-lbl">Received</span>
                                    </div>
                                </div>
                                <div className="stat-card glass" style={{ borderTopColor: 'var(--clr-preparing)' }}>
                                    <span className="stat-icon">🟠</span>
                                    <div className="stat-data">
                                        <span className="stat-num">{counts.preparing}</span>
                                        <span className="stat-lbl">Preparing</span>
                                    </div>
                                </div>
                                <div className="stat-card glass" style={{ borderTopColor: 'var(--clr-serving)' }}>
                                    <span className="stat-icon">🟢</span>
                                    <div className="stat-data">
                                        <span className="stat-num">{counts.serving}</span>
                                        <span className="stat-lbl">Serving</span>
                                    </div>
                                </div>
                                <div className="stat-card glass" style={{ borderTopColor: 'var(--clr-accent)' }}>
                                    <span className="stat-icon">🎉</span>
                                    <div className="stat-data">
                                        <span className="stat-num">{counts.scheduled}</span>
                                        <span className="stat-lbl">Scheduled</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Filters */}
                            <div className="admin-filters">
                                {['all', 'received', 'preparing', 'serving', 'scheduled'].map((f) => (
                                    <button
                                        key={f}
                                        className={`filter-btn cursor-target ${filter === f ? 'active' : ''}`}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f === 'all' ? '📋 All' : f === 'scheduled' ? '🎉 Scheduled' : `${statusConfig[f].icon} ${statusConfig[f].label}`}
                                    </button>
                                ))}
                            </div>

                            {/* Orders */}
                            <div className="admin-orders">
                                {filteredOrders.length === 0 ? (
                                    <div className="no-orders">
                                        <span className="no-orders-icon">📭</span>
                                        <h3>No orders{filter !== 'all' ? ` with status "${filter}"` : ''}</h3>
                                        <p>Orders will appear here when customers place them</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {filteredOrders.map((order) => {
                                            const config = statusConfig[order.status];
                                            return (
                                                <motion.div
                                                    key={order.id}
                                                    className="order-card glass"
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                >
                                                    <div className="order-card-header">
                                                        <div className="order-token-info">
                                                            <span className="order-token">#{order.token}</span>
                                                            <span className="order-time">
                                                                {new Date(order.timestamp).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className="status-chip"
                                                            style={{
                                                                background: `${config.color}20`,
                                                                color: config.color,
                                                                borderColor: `${config.color}40`,
                                                            }}
                                                        >
                                                            {config.icon} {config.label}
                                                        </span>
                                                    </div>

                                                    {order.scheduleInfo?.isPartyOrder && (
                                                        <div className="order-schedule-banner">
                                                            <span className="order-schedule-badge">🎉 Party Order</span>
                                                            <span className="order-schedule-detail">📅 {order.scheduleInfo.date} · {order.scheduleInfo.timeSlot}</span>
                                                            <span className="order-schedule-detail">👤 {order.scheduleInfo.name} · {order.scheduleInfo.phone}</span>
                                                        </div>
                                                    )}

                                                    <div className="order-card-items">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="order-card-item">
                                                                <span>{item.emoji} {item.name}</span>
                                                                <span className="item-qty">×{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="order-card-footer">
                                                        <span className="order-card-total">Total: ₹{order.totalPrice}</span>
                                                        <div className="order-actions">
                                                            {config.next ? (
                                                                <button
                                                                    className="btn btn-primary btn-sm cursor-target"
                                                                    onClick={() => handleStatusUpdate(order.id, config.next)}
                                                                >
                                                                    Move to {statusConfig[config.next].label} {statusConfig[config.next].icon}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-sm complete-btn cursor-target"
                                                                    onClick={() => handleComplete(order.id)}
                                                                >
                                                                    ✅ Complete Order
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </motion.div>
                    ) : activeTab === 'stock' ? (
                        <motion.div
                            key="stock"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <StockManagement />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <AdminDashboard />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

