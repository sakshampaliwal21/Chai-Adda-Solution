import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders } from '../context/OrderContext';
import './Token.css';

const statusSteps = [
    { key: 'received', label: 'Order Received', icon: '🟡', desc: 'Your order is in the queue' },
    { key: 'preparing', label: 'Preparing Food', icon: '🟠', desc: 'Our chefs are on it!' },
    { key: 'serving', label: 'Ready to Serve', icon: '🟢', desc: 'Pick up your order!' },
];

export default function Token() {
    const { getLatestOrder } = useOrders();
    const [order, setOrder] = useState(null);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const latestOrder = getLatestOrder();
        setOrder(latestOrder);
    }, [getLatestOrder]);

    useEffect(() => {
        if (!order) return;
        const interval = setInterval(() => {
            setElapsed((e) => e + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [order]);

    if (!order) {
        return (
            <div className="token-page page-enter">
                <div className="container">
                    <div className="token-empty">
                        <span className="empty-icon">🎟️</span>
                        <h2>No Active Order</h2>
                        <p>Place an order to get your token</p>
                        <Link to="/menu" className="btn btn-primary cursor-target">Order Now →</Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusIndex = statusSteps.findIndex((s) => s.key === order.status);
    const remainingTime = Math.max(0, order.estimatedTime * 60 - elapsed);
    const mins = Math.floor(remainingTime / 60);
    const secs = remainingTime % 60;

    return (
        <div className="token-page page-enter">
            <div className="container">
                <motion.div
                    className="token-wrapper"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Token Card */}
                    <motion.div
                        className="token-card glass-strong"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <div className="token-badge">YOUR TOKEN</div>
                        {order.scheduleInfo?.isPartyOrder && (
                            <div className="token-party-badge">🎉 Party Order</div>
                        )}
                        <motion.h1
                            className="token-number"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                        >
                            #{order.token}
                        </motion.h1>
                        {order.scheduleInfo?.isPartyOrder ? (
                            <div className="token-schedule-info">
                                <span className="time-label">Scheduled Pickup</span>
                                <span className="time-value schedule-time">📅 {order.scheduleInfo.date}</span>
                                <span className="time-value schedule-slot">🕐 {order.scheduleInfo.timeSlot}</span>
                                <span className="schedule-contact">👤 {order.scheduleInfo.name} · {order.scheduleInfo.phone}</span>
                            </div>
                        ) : (
                            <div className="token-time">
                                <span className="time-label">Estimated Wait</span>
                                <span className="time-value">
                                    {mins}:{secs.toString().padStart(2, '0')}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* Order Status Timeline */}
                    <motion.div
                        className="timeline-card glass"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2>Order Status</h2>
                        <div className="timeline">
                            {statusSteps.map((step, index) => {
                                const isActive = index <= statusIndex;
                                const isCurrent = index === statusIndex;
                                return (
                                    <div
                                        key={step.key}
                                        className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                                    >
                                        <div className="timeline-dot-wrap">
                                            <div className="timeline-dot">
                                                {isActive ? step.icon : '⚪'}
                                            </div>
                                            {index < statusSteps.length - 1 && (
                                                <div className={`timeline-line ${isActive ? 'active' : ''}`}></div>
                                            )}
                                        </div>
                                        <div className="timeline-info">
                                            <h4>{step.label}</h4>
                                            <p>{step.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Order Details */}
                    <motion.div
                        className="order-details-card glass"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2>Order Details</h2>
                        <div className="order-items-list">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item-row">
                                    <span className="order-item-emoji">{item.emoji}</span>
                                    <span className="order-item-name">{item.name}</span>
                                    <span className="order-item-qty">×{item.quantity}</span>
                                    <span className="order-item-price">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="order-total-row">
                            <span>Total Paid</span>
                            <span className="order-total-value">₹{order.totalPrice}</span>
                        </div>
                        <div className="order-meta">
                            <span>Placed at {new Date(order.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </motion.div>

                    <div className="token-actions">
                        <Link to="/menu" className="btn btn-primary cursor-target">Order More →</Link>
                        <Link to="/" className="btn btn-secondary cursor-target">Back to Home</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
