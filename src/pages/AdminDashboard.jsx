import { useState, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getDailyRevenue,
    getWeeklyRevenue,
    getMonthlyRevenue,
    getComparativeData,
    getHeatmapData,
    getTodayStats,
    getThisWeekStats,
    getThisMonthStats,
    exportToCSV,
    generatePrintReport,
} from '../data/dashboardData';
import './AdminDashboard.css';

// Animated counter component
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1200;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.round(start + (end - start) * eased);
            setDisplay(current);
            if (progress < 1) {
                ref.current = requestAnimationFrame(animate);
            }
        };

        ref.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(ref.current);
    }, [value]);

    return (
        <span>
            {prefix}{display.toLocaleString()}{suffix}
        </span>
    );
}

export default function AdminDashboard() {
    const [chartView, setChartView] = useState('daily');
    const [hoveredBar, setHoveredBar] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [exportingCSV, setExportingCSV] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [mounted, setMounted] = useState(false);

    const today = getTodayStats();
    const weekStats = getThisWeekStats();
    const monthStats = getThisMonthStats();
    const comparative = getComparativeData();
    const heatmap = getHeatmapData();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Get chart data based on view
    const getChartData = () => {
        switch (chartView) {
            case 'weekly':
                return getWeeklyRevenue().map((w) => ({
                    label: w.label,
                    value: w.revenue,
                    orders: w.orders,
                    sub: `${w.orders} orders`,
                }));
            case 'monthly':
                return getMonthlyRevenue().map((m) => ({
                    label: m.label,
                    value: m.revenue,
                    orders: m.orders,
                    sub: `${m.orders} orders`,
                }));
            default:
                return getDailyRevenue(30).map((d) => ({
                    label: `${d.dayNum} ${d.month}`,
                    value: d.revenue,
                    orders: d.orders,
                    sub: d.dayName,
                }));
        }
    };

    const chartData = getChartData();
    const maxValue = Math.max(...chartData.map((d) => d.value));

    // Heatmap color scale
    const getHeatColor = (count) => {
        const maxCount = Math.max(...heatmap.data.map((d) => d.count));
        const ratio = count / maxCount;
        if (ratio < 0.2) return 'var(--heat-1)';
        if (ratio < 0.4) return 'var(--heat-2)';
        if (ratio < 0.6) return 'var(--heat-3)';
        if (ratio < 0.8) return 'var(--heat-4)';
        return 'var(--heat-5)';
    };

    const getHeatOpacity = (count) => {
        const maxCount = Math.max(...heatmap.data.map((d) => d.count));
        return 0.3 + (count / maxCount) * 0.7;
    };

    // Export handlers
    const handleExportCSV = () => {
        setExportingCSV(true);
        setTimeout(() => {
            const csv = exportToCSV();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chai-adda-revenue-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setExportingCSV(false);
        }, 600);
    };

    const handleExportPDF = () => {
        setExportingPDF(true);
        setTimeout(() => {
            const html = generatePrintReport();
            const printWindow = window.open('', '_blank', 'width=900,height=700');
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                setExportingPDF(false);
            }, 500);
        }, 600);
    };

    const totalOrders = comparative.thisMonth.orders + comparative.lastMonth.orders + 142;

    return (
        <div className="admin-dashboard">
            {/* KPI Cards */}
            <motion.div
                className="dashboard-kpis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <div className="kpi-card glass">
                    <div className="kpi-icon-wrap kpi-today">
                        <span className="kpi-icon" style={{ fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'normal' }}>Day</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value">
                            <AnimatedNumber value={today.revenue} prefix="₹" />
                        </span>
                        <span className="kpi-label">Today's Revenue</span>
                    </div>
                    <div className="kpi-sparkline">
                        <span className="kpi-orders">{today.orders} orders</span>
                    </div>
                </div>

                <div className="kpi-card glass">
                    <div className="kpi-icon-wrap kpi-week">
                        <span className="kpi-icon" style={{ fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'normal' }}>Week</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value">
                            <AnimatedNumber value={weekStats.revenue} prefix="₹" />
                        </span>
                        <span className="kpi-label">This Week</span>
                    </div>
                    <div className="kpi-sparkline">
                        <span className="kpi-orders">{weekStats.orders} orders</span>
                    </div>
                </div>

                <div className="kpi-card glass">
                    <div className="kpi-icon-wrap kpi-month">
                        <span className="kpi-icon" style={{ fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'normal' }}>Month</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value">
                            <AnimatedNumber value={monthStats.revenue} prefix="₹" />
                        </span>
                        <span className="kpi-label">This Month</span>
                    </div>
                    <div className="kpi-sparkline">
                        <span className="kpi-orders">{monthStats.orders} orders</span>
                    </div>
                </div>

                <div className="kpi-card glass">
                    <div className="kpi-icon-wrap kpi-total">
                        <span className="kpi-icon" style={{ fontSize: '0.85rem', fontWeight: 'bold', fontStyle: 'normal' }}>Total</span>
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-value">
                            <AnimatedNumber value={totalOrders} />
                        </span>
                        <span className="kpi-label">Total Orders</span>
                    </div>
                    <div className="kpi-sparkline">
                        <span className="kpi-orders">All time</span>
                    </div>
                </div>
            </motion.div>

            {/* Revenue Chart */}
            <motion.div
                className="dashboard-section glass-strong"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <div className="section-header">
                    <div>
                        <h2>Revenue Overview</h2>
                        <p className="section-subtitle">Track your earnings over time</p>
                    </div>
                    <div className="chart-toggles">
                        {['daily', 'weekly', 'monthly'].map((view) => (
                            <button
                                key={view}
                                className={`chart-toggle cursor-target ${chartView === view ? 'active' : ''}`}
                                onClick={() => setChartView(view)}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chart-container">
                    <div className="chart-y-axis">
                        {[100, 75, 50, 25, 0].map((pct) => (
                            <span key={pct} className="chart-y-label">
                                ₹{Math.round((maxValue * pct) / 100).toLocaleString()}
                            </span>
                        ))}
                    </div>
                    <div className="chart-bars-wrapper">
                        <div className="chart-grid-lines">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="chart-grid-line" />
                            ))}
                        </div>
                        <div className="chart-bars">
                            <AnimatePresence mode="wait">
                                {chartData.map((d, i) => {
                                    const heightPct = (d.value / maxValue) * 100;
                                    return (
                                        <div
                                            key={`${chartView}-${i}`}
                                            className={`chart-bar-group ${hoveredBar === i ? 'hovered' : ''}`}
                                            onMouseEnter={() => setHoveredBar(i)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        >
                                            <div
                                                className="chart-bar"
                                                style={{
                                                    height: mounted ? `${heightPct}%` : '0%',
                                                    transitionDelay: `${i * 30}ms`,
                                                }}
                                            />
                                            <span className="chart-bar-label">{d.sub || d.label}</span>
                                            {hoveredBar === i && (
                                                <div className="chart-tooltip">
                                                    <strong>{d.label}</strong>
                                                    <span>₹{d.value.toLocaleString()}</span>
                                                    <span className="tooltip-orders">{d.orders} orders</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Comparative Analysis */}
            <motion.div
                className="dashboard-section glass-strong"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <div className="section-header">
                    <div>
                        <h2>Comparative Analysis</h2>
                        <p className="section-subtitle">This month vs last month performance</p>
                    </div>
                </div>

                <div className="comparative-grid">
                    {/* Revenue Comparison */}
                    <div className="compare-metric-card">
                        <div className="compare-metric-header">
                            <span className="compare-metric-icon">💰</span>
                            <span className="compare-metric-title">Revenue</span>
                            <span className={`compare-badge ${comparative.changes.revenue >= 0 ? 'positive' : 'negative'}`}>
                                {comparative.changes.revenue >= 0 ? '▲' : '▼'} {Math.abs(comparative.changes.revenue)}%
                            </span>
                        </div>
                        <div className="compare-values">
                            <div className="compare-current">
                                <span className="compare-period">This Month</span>
                                <span className="compare-amount">₹{comparative.thisMonth.revenue.toLocaleString()}</span>
                            </div>
                            <div className="compare-divider">vs</div>
                            <div className="compare-previous">
                                <span className="compare-period">Last Month</span>
                                <span className="compare-amount dim">₹{comparative.lastMonth.revenue.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="compare-bar-track">
                            <div
                                className="compare-bar-fill current"
                                style={{ width: `${Math.min(100, (comparative.thisMonth.revenue / Math.max(comparative.thisMonth.revenue, comparative.lastMonth.revenue)) * 100)}%` }}
                            />
                            <div
                                className="compare-bar-fill previous"
                                style={{ width: `${Math.min(100, (comparative.lastMonth.revenue / Math.max(comparative.thisMonth.revenue, comparative.lastMonth.revenue)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Orders Comparison */}
                    <div className="compare-metric-card">
                        <div className="compare-metric-header">
                            <span className="compare-metric-icon">📦</span>
                            <span className="compare-metric-title">Orders</span>
                            <span className={`compare-badge ${comparative.changes.orders >= 0 ? 'positive' : 'negative'}`}>
                                {comparative.changes.orders >= 0 ? '▲' : '▼'} {Math.abs(comparative.changes.orders)}%
                            </span>
                        </div>
                        <div className="compare-values">
                            <div className="compare-current">
                                <span className="compare-period">This Month</span>
                                <span className="compare-amount">{comparative.thisMonth.orders}</span>
                            </div>
                            <div className="compare-divider">vs</div>
                            <div className="compare-previous">
                                <span className="compare-period">Last Month</span>
                                <span className="compare-amount dim">{comparative.lastMonth.orders}</span>
                            </div>
                        </div>
                        <div className="compare-bar-track">
                            <div
                                className="compare-bar-fill current"
                                style={{ width: `${Math.min(100, (comparative.thisMonth.orders / Math.max(comparative.thisMonth.orders, comparative.lastMonth.orders)) * 100)}%` }}
                            />
                            <div
                                className="compare-bar-fill previous"
                                style={{ width: `${Math.min(100, (comparative.lastMonth.orders / Math.max(comparative.thisMonth.orders, comparative.lastMonth.orders)) * 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Avg Order Value */}
                    <div className="compare-metric-card">
                        <div className="compare-metric-header">
                            <span className="compare-metric-icon">🎯</span>
                            <span className="compare-metric-title">Avg Order Value</span>
                            <span className={`compare-badge ${comparative.changes.avgOrderValue >= 0 ? 'positive' : 'negative'}`}>
                                {comparative.changes.avgOrderValue >= 0 ? '▲' : '▼'} {Math.abs(comparative.changes.avgOrderValue)}%
                            </span>
                        </div>
                        <div className="compare-values">
                            <div className="compare-current">
                                <span className="compare-period">This Month</span>
                                <span className="compare-amount">₹{comparative.thisMonth.avgOrderValue}</span>
                            </div>
                            <div className="compare-divider">vs</div>
                            <div className="compare-previous">
                                <span className="compare-period">Last Month</span>
                                <span className="compare-amount dim">₹{comparative.lastMonth.avgOrderValue}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Items */}
                <div className="top-items-section">
                    <h3>🏆 Top Selling Items This Month</h3>
                    <div className="top-items-list">
                        {comparative.topItems.map((item, i) => (
                            <div key={item.name} className="top-item">
                                <span className="top-item-rank">#{i + 1}</span>
                                <span className="top-item-emoji">{item.emoji}</span>
                                <div className="top-item-info">
                                    <span className="top-item-name">{item.name}</span>
                                    <span className="top-item-stats">{item.sold} sold · ₹{item.revenue.toLocaleString()}</span>
                                </div>
                                <div className="top-item-bar-track">
                                    <div
                                        className="top-item-bar-fill"
                                        style={{
                                            width: mounted ? `${(item.sold / comparative.topItems[0].sold) * 100}%` : '0%',
                                            transitionDelay: `${i * 100}ms`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Export Section */}
            <motion.div
                className="dashboard-section glass-strong"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <div className="section-header">
                    <div>
                        <h2>Export Data</h2>
                        <p className="section-subtitle">Download reports for offline analysis</p>
                    </div>
                </div>

                <div className="export-grid">
                    <button
                        className="export-card cursor-target"
                        onClick={handleExportCSV}
                        disabled={exportingCSV}
                    >
                        <div className="export-icon-wrap csv">
                            <span className="export-icon">📄</span>
                        </div>
                        <div className="export-info">
                            <h3>Export to Excel (CSV)</h3>
                            <p>Download daily revenue data as a spreadsheet</p>
                        </div>
                        <div className="export-action">
                            {exportingCSV ? (
                                <span className="export-spinner" />
                            ) : (
                                <span className="export-arrow">↓</span>
                            )}
                        </div>
                    </button>

                    <button
                        className="export-card cursor-target"
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                    >
                        <div className="export-icon-wrap pdf">
                            <span className="export-icon">📑</span>
                        </div>
                        <div className="export-info">
                            <h3>Export to PDF</h3>
                            <p>Generate a printable revenue report</p>
                        </div>
                        <div className="export-action">
                            {exportingPDF ? (
                                <span className="export-spinner" />
                            ) : (
                                <span className="export-arrow">↓</span>
                            )}
                        </div>
                    </button>
                </div>
            </motion.div>

            {/* Peak Hour Heatmap */}
            <motion.div
                className="dashboard-section glass-strong"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
            >
                <div className="section-header">
                    <div>
                        <h2>Peak Hour Heatmap</h2>
                        <p className="section-subtitle">Visualize your busiest times throughout the week</p>
                    </div>
                </div>

                <div className="heatmap-container">
                    <div className="heatmap-grid">
                        {/* Hour headers */}
                        <div className="heatmap-corner" />
                        {heatmap.hours.map((hour) => (
                            <div key={hour} className="heatmap-hour-label">{hour}</div>
                        ))}

                        {/* Day rows */}
                        {heatmap.days.map((day, dayIdx) => (
                            <Fragment key={day}>
                                <div className="heatmap-day-label">{day}</div>
                                {heatmap.hours.map((hour, hourIdx) => {
                                    const cell = heatmap.data.find(
                                        (d) => d.dayIdx === dayIdx && d.hourIdx === hourIdx
                                    );
                                    const isHovered =
                                        hoveredCell?.dayIdx === dayIdx && hoveredCell?.hourIdx === hourIdx;
                                    return (
                                        <div
                                            key={`${day}-${hour}`}
                                            className={`heatmap-cell ${isHovered ? 'hovered' : ''}`}
                                            style={{
                                                backgroundColor: getHeatColor(cell?.count || 0),
                                                opacity: getHeatOpacity(cell?.count || 0),
                                            }}
                                            onMouseEnter={() => setHoveredCell({ dayIdx, hourIdx })}
                                            onMouseLeave={() => setHoveredCell(null)}
                                        >
                                            {isHovered && (
                                                <div className="heatmap-tooltip">
                                                    <strong>{day} {hour}</strong>
                                                    <span>{cell?.count || 0} orders</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </Fragment>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="heatmap-legend">
                        <span className="heatmap-legend-label">Fewer orders</span>
                        <div className="heatmap-legend-scale">
                            <div className="heatmap-legend-color" style={{ backgroundColor: 'var(--heat-1)' }} />
                            <div className="heatmap-legend-color" style={{ backgroundColor: 'var(--heat-2)' }} />
                            <div className="heatmap-legend-color" style={{ backgroundColor: 'var(--heat-3)' }} />
                            <div className="heatmap-legend-color" style={{ backgroundColor: 'var(--heat-4)' }} />
                            <div className="heatmap-legend-color" style={{ backgroundColor: 'var(--heat-5)' }} />
                        </div>
                        <span className="heatmap-legend-label">More orders</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
