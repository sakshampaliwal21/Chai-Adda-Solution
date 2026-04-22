import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import './Admin.css';

const statusConfig = {
    received: { label: 'Received', icon: '🟡', color: 'var(--clr-received)', next: 'preparing' },
    preparing: { label: 'Preparing', icon: '🟠', color: 'var(--clr-preparing)', next: 'serving' },
    serving: { label: 'Serving', icon: '🟢', color: 'var(--clr-serving)', next: null },
};

export default function Admin() {
    const { orders, updateOrderStatus, removeOrder } = useOrders();
    const { addToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [filter, setFilter] = useState('all');

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
                <div className="container">
                    <motion.div
                        className="admin-login glass-strong"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
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
                        <h1>📊 Admin Dashboard</h1>
                        <p>Manage and track all incoming orders</p>
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsAuthenticated(false)}
                    >
                        Logout
                    </button>
                </motion.div>

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
            </div>
        </div>
    );
}
