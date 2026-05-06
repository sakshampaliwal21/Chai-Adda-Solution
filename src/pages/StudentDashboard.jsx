import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getStudentStats, getStudentTransactions } from '../data/dashboardData';
import './StudentDashboard.css';

// Animated counter
function AnimatedNum({ value, prefix = '', suffix = '' }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const end = value;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(end * eased));
            if (progress < 1) ref.current = requestAnimationFrame(animate);
        };

        ref.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(ref.current);
    }, [value]);

    return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export default function StudentDashboard() {
    const stats = getStudentStats();
    const transactions = getStudentTransactions();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    const maxMonthlySpend = Math.max(...stats.monthlySpend.map((m) => m.spent));

    const orderChange = stats.lastMonthOrders > 0
        ? Math.round(((stats.thisMonthOrders - stats.lastMonthOrders) / stats.lastMonthOrders) * 100)
        : stats.thisMonthOrders > 0 ? 100 : 0;

    const spendChange = stats.lastMonthSpent > 0
        ? Math.round(((stats.thisMonthSpent - stats.lastMonthSpent) / stats.lastMonthSpent) * 100)
        : stats.thisMonthSpent > 0 ? 100 : 0;

    return (
        <div className="student-dashboard">
            {/* Lifetime Stats */}
            <motion.div
                className="student-stats-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <div className="student-stat-card glass">
                    <div className="student-stat-icon-wrap stat-orders">
                        <span>🛒</span>
                    </div>
                    <div className="student-stat-content">
                        <span className="student-stat-value">
                            <AnimatedNum value={stats.totalOrders} />
                        </span>
                        <span className="student-stat-label">Lifetime Orders</span>
                    </div>
                </div>

                <div className="student-stat-card glass">
                    <div className="student-stat-icon-wrap stat-spent">
                        <span>💸</span>
                    </div>
                    <div className="student-stat-content">
                        <span className="student-stat-value">
                            <AnimatedNum value={stats.totalSpent} prefix="₹" />
                        </span>
                        <span className="student-stat-label">Total Spent</span>
                    </div>
                </div>

                <div className="student-stat-card glass">
                    <div className="student-stat-icon-wrap stat-fav">
                        <span>{stats.favoriteItem?.emoji || '☕'}</span>
                    </div>
                    <div className="student-stat-content">
                        <span className="student-stat-value-text">{stats.favoriteItem?.name || 'N/A'}</span>
                        <span className="student-stat-label">Most Ordered Item</span>
                    </div>
                </div>

                <div className="student-stat-card glass">
                    <div className="student-stat-icon-wrap stat-member">
                        <span>📅</span>
                    </div>
                    <div className="student-stat-content">
                        <span className="student-stat-value-text">{stats.memberSince}</span>
                        <span className="student-stat-label">Member Since</span>
                    </div>
                </div>
            </motion.div>

            {/* Monthly Comparison */}
            <motion.div
                className="student-section glass-strong"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <h2>📊 Monthly Breakdown</h2>
                <p className="student-section-sub">Your spending this month vs last month</p>

                <div className="student-monthly-grid">
                    <div className="student-monthly-card">
                        <div className="student-monthly-header">
                            <span className="student-monthly-period">This Month</span>
                        </div>
                        <div className="student-monthly-stats">
                            <div className="student-monthly-metric">
                                <span className="student-monthly-num">{stats.thisMonthOrders}</span>
                                <span className="student-monthly-lbl">Orders</span>
                            </div>
                            <div className="student-monthly-metric">
                                <span className="student-monthly-num">₹{stats.thisMonthSpent.toLocaleString()}</span>
                                <span className="student-monthly-lbl">Spent</span>
                            </div>
                        </div>
                    </div>

                    <div className="student-monthly-vs">
                        <div className="vs-circle">VS</div>
                        <div className="vs-changes">
                            <span className={`vs-badge ${orderChange >= 0 ? 'positive' : 'negative'}`}>
                                {orderChange >= 0 ? '▲' : '▼'} {Math.abs(orderChange)}% orders
                            </span>
                            <span className={`vs-badge ${spendChange >= 0 ? 'positive' : 'negative'}`}>
                                {spendChange >= 0 ? '▲' : '▼'} {Math.abs(spendChange)}% spend
                            </span>
                        </div>
                    </div>

                    <div className="student-monthly-card dim">
                        <div className="student-monthly-header">
                            <span className="student-monthly-period">Last Month</span>
                        </div>
                        <div className="student-monthly-stats">
                            <div className="student-monthly-metric">
                                <span className="student-monthly-num">{stats.lastMonthOrders}</span>
                                <span className="student-monthly-lbl">Orders</span>
                            </div>
                            <div className="student-monthly-metric">
                                <span className="student-monthly-num">₹{stats.lastMonthSpent.toLocaleString()}</span>
                                <span className="student-monthly-lbl">Spent</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Monthly Spend Chart */}
            <motion.div
                className="student-section glass-strong"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <h2>📈 Spending Trend</h2>
                <p className="student-section-sub">Your spend over the last 6 months</p>

                <div className="student-chart">
                    {stats.monthlySpend.map((m, i) => {
                        const heightPct = maxMonthlySpend > 0 ? (m.spent / maxMonthlySpend) * 100 : 0;
                        return (
                            <div key={m.label} className="student-chart-col">
                                <div className="student-chart-value">₹{m.spent.toLocaleString()}</div>
                                <div className="student-chart-bar-track">
                                    <div
                                        className="student-chart-bar"
                                        style={{
                                            height: mounted ? `${Math.max(4, heightPct)}%` : '0%',
                                            transitionDelay: `${i * 80}ms`,
                                        }}
                                    />
                                </div>
                                <div className="student-chart-label">{m.label}</div>
                                <div className="student-chart-orders">{m.orders} orders</div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
                className="student-section glass-strong"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <h2>🧾 Recent Transactions</h2>
                <p className="student-section-sub">Your order history at a glance</p>

                <div className="student-transactions">
                    {transactions.slice(0, 12).map((txn) => (
                        <div key={txn.id} className="student-txn-card">
                            <div className="student-txn-left">
                                <div className="student-txn-token">#{txn.token}</div>
                                <div className="student-txn-date">
                                    {new Date(txn.date).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                    <span className="student-txn-time">
                                        {new Date(txn.date).toLocaleTimeString('en-US', {
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="student-txn-items">
                                {txn.items.map((item) => (
                                    <span key={item.id} className="student-txn-item">
                                        {item.emoji} {item.quantity}×{item.name}
                                    </span>
                                ))}
                            </div>
                            <div className="student-txn-right">
                                <span className="student-txn-total">₹{txn.totalPrice}</span>
                                <span className={`student-txn-method ${txn.paymentMethod.toLowerCase()}`}>
                                    {txn.paymentMethod === 'UPI' ? '📱' : '💵'} {txn.paymentMethod}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
