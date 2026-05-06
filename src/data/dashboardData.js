// ===== Dashboard Dummy Data =====
// Provides realistic analytics data for Admin & Student dashboards

const MENU_ITEMS = [
    { id: 'b1', name: 'Masala Tea', emoji: '🍵', price: 20 },
    { id: 'b2', name: 'Ginger Chai', emoji: '🫖', price: 25 },
    { id: 'b3', name: 'Cutting Chai', emoji: '☕', price: 10 },
    { id: 'b4', name: 'Kulhad Chai', emoji: '🏺', price: 35 },
    { id: 'b5', name: 'Black Coffee', emoji: '☕', price: 40 },
    { id: 'f1', name: 'Samosa', emoji: '🥟', price: 15 },
    { id: 'f2', name: 'Paneer Momo', emoji: '🥟', price: 99 },
    { id: 'f3', name: 'Veg Maggi', emoji: '🍜', price: 50 },
    { id: 'f4', name: 'Bun Maska', emoji: '🍞', price: 30 },
    { id: 'f5', name: 'Spring Roll', emoji: '🥟', price: 80 },
    { id: 'f6', name: 'Paneer Sandwich', emoji: '🥪', price: 70 },
    { id: 'f7', name: 'Bread Butter', emoji: '🍞', price: 25 },
];

// Seeded random for consistent data across renders
function seededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const rand = seededRandom(42);

// Generate daily revenue for the last 60 days
function generateDailyRevenue() {
    const data = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay();
        // Weekends have higher revenue
        const baseRevenue = dayOfWeek === 0 || dayOfWeek === 6 ? 6000 : 4000;
        const variance = 2000;
        const revenue = Math.round(baseRevenue + rand() * variance);
        const orders = Math.round(revenue / (45 + rand() * 30));
        data.push({
            date: date.toISOString().split('T')[0],
            dateObj: new Date(date),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            revenue,
            orders,
            avgOrderValue: Math.round(revenue / orders),
        });
    }
    return data;
}

// Generate peak hour heatmap data
function generateHeatmapData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = [];
    for (let h = 8; h <= 20; h++) {
        hours.push(`${h > 12 ? h - 12 : h}${h >= 12 ? 'PM' : 'AM'}`);
    }

    const data = [];
    days.forEach((day, dayIdx) => {
        hours.forEach((hour, hourIdx) => {
            const actualHour = hourIdx + 8;
            let base = 5;
            // Morning chai rush: 8-10 AM
            if (actualHour >= 8 && actualHour <= 10) base = 18;
            // Lunch: 12-2 PM
            if (actualHour >= 12 && actualHour <= 14) base = 22;
            // Evening tea: 4-6 PM
            if (actualHour >= 16 && actualHour <= 18) base = 25;
            // Weekends are busier overall
            if (dayIdx >= 5) base = Math.round(base * 1.3);
            // Late hours are quieter
            if (actualHour >= 19) base = 4;

            const count = Math.max(1, Math.round(base + (rand() - 0.5) * base * 0.6));
            data.push({ day, hour, dayIdx, hourIdx, count });
        });
    });

    return { days, hours, data };
}

// Generate student transaction history
function generateStudentTransactions() {
    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 28; i++) {
        const daysAgo = Math.floor(rand() * 180); // Spread across 6 months
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(8 + rand() * 12), Math.floor(rand() * 60));

        const numItems = Math.floor(1 + rand() * 3);
        const items = [];
        const usedIds = new Set();
        for (let j = 0; j < numItems; j++) {
            let item;
            do {
                item = MENU_ITEMS[Math.floor(rand() * MENU_ITEMS.length)];
            } while (usedIds.has(item.id));
            usedIds.add(item.id);
            const quantity = Math.floor(1 + rand() * 3);
            items.push({ ...item, quantity });
        }

        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        transactions.push({
            id: `txn_${1000 + i}`,
            date: date.toISOString(),
            items,
            totalPrice,
            paymentMethod: rand() > 0.5 ? 'UPI' : 'Cash',
            token: Math.floor(10 + rand() * 90),
        });
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    return transactions;
}

// Cached data
const dailyRevenue = generateDailyRevenue();
const heatmapData = generateHeatmapData();
const studentTransactions = generateStudentTransactions();

// ===== Export Functions =====

export function getDailyRevenue(days = 30) {
    return dailyRevenue.slice(-days);
}

export function getWeeklyRevenue() {
    const weeks = [];
    for (let i = 0; i < 8; i++) {
        const weekStart = dailyRevenue.length - 1 - i * 7;
        const weekEnd = Math.max(0, weekStart - 6);
        const weekDays = dailyRevenue.slice(weekEnd, weekStart + 1);
        const revenue = weekDays.reduce((sum, d) => sum + d.revenue, 0);
        const orders = weekDays.reduce((sum, d) => sum + d.orders, 0);
        const startDate = weekDays[0]?.date || '';
        const endDate = weekDays[weekDays.length - 1]?.date || '';
        weeks.unshift({
            label: `${weekDays[0]?.dayNum || ''} ${weekDays[0]?.month || ''} - ${weekDays[weekDays.length - 1]?.dayNum || ''} ${weekDays[weekDays.length - 1]?.month || ''}`,
            revenue,
            orders,
            startDate,
            endDate,
            avgOrderValue: orders > 0 ? Math.round(revenue / orders) : 0,
        });
    }
    return weeks;
}

export function getMonthlyRevenue() {
    const months = {};
    dailyRevenue.forEach((d) => {
        const key = `${d.dateObj.getFullYear()}-${String(d.dateObj.getMonth() + 1).padStart(2, '0')}`;
        if (!months[key]) {
            months[key] = {
                label: d.dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                revenue: 0,
                orders: 0,
            };
        }
        months[key].revenue += d.revenue;
        months[key].orders += d.orders;
    });
    return Object.values(months).map((m) => ({
        ...m,
        avgOrderValue: m.orders > 0 ? Math.round(m.revenue / m.orders) : 0,
    }));
}

export function getComparativeData() {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthData = dailyRevenue.filter((d) => {
        const dt = d.dateObj;
        return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
    });

    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastYear = lastMonthDate.getFullYear();

    const lastMonthData = dailyRevenue.filter((d) => {
        const dt = d.dateObj;
        return dt.getMonth() === lastMonth && dt.getFullYear() === lastYear;
    });

    const sumRevenue = (arr) => arr.reduce((s, d) => s + d.revenue, 0);
    const sumOrders = (arr) => arr.reduce((s, d) => s + d.orders, 0);

    const thisRevenue = sumRevenue(thisMonthData);
    const lastRevenue = sumRevenue(lastMonthData);
    const thisOrders = sumOrders(thisMonthData);
    const lastOrders = sumOrders(lastMonthData);
    const thisAvg = thisOrders > 0 ? Math.round(thisRevenue / thisOrders) : 0;
    const lastAvg = lastOrders > 0 ? Math.round(lastRevenue / lastOrders) : 0;

    const pctChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    // Top items this month (simulated)
    const topItems = [
        { name: 'Masala Tea', emoji: '🍵', sold: Math.round(thisOrders * 1.8), revenue: Math.round(thisOrders * 1.8 * 20) },
        { name: 'Cutting Chai', emoji: '☕', sold: Math.round(thisOrders * 1.2), revenue: Math.round(thisOrders * 1.2 * 10) },
        { name: 'Samosa', emoji: '🥟', sold: Math.round(thisOrders * 0.9), revenue: Math.round(thisOrders * 0.9 * 15) },
        { name: 'Paneer Momo', emoji: '🥟', sold: Math.round(thisOrders * 0.6), revenue: Math.round(thisOrders * 0.6 * 99) },
        { name: 'Veg Maggi', emoji: '🍜', sold: Math.round(thisOrders * 0.5), revenue: Math.round(thisOrders * 0.5 * 50) },
    ];

    return {
        thisMonth: {
            label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            revenue: thisRevenue,
            orders: thisOrders,
            avgOrderValue: thisAvg,
            daysRecorded: thisMonthData.length,
        },
        lastMonth: {
            label: lastMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            revenue: lastRevenue,
            orders: lastOrders,
            avgOrderValue: lastAvg,
            daysRecorded: lastMonthData.length,
        },
        changes: {
            revenue: pctChange(thisRevenue, lastRevenue),
            orders: pctChange(thisOrders, lastOrders),
            avgOrderValue: pctChange(thisAvg, lastAvg),
        },
        topItems,
    };
}

export function getHeatmapData() {
    return heatmapData;
}

export function getTodayStats() {
    const today = dailyRevenue[dailyRevenue.length - 1];
    return today || { revenue: 0, orders: 0, avgOrderValue: 0 };
}

export function getThisWeekStats() {
    const lastSevenDays = dailyRevenue.slice(-7);
    return {
        revenue: lastSevenDays.reduce((s, d) => s + d.revenue, 0),
        orders: lastSevenDays.reduce((s, d) => s + d.orders, 0),
    };
}

export function getThisMonthStats() {
    const now = new Date();
    const thisMonthDays = dailyRevenue.filter(
        (d) => d.dateObj.getMonth() === now.getMonth() && d.dateObj.getFullYear() === now.getFullYear()
    );
    return {
        revenue: thisMonthDays.reduce((s, d) => s + d.revenue, 0),
        orders: thisMonthDays.reduce((s, d) => s + d.orders, 0),
    };
}

// ===== Student Data =====

export function getStudentTransactions() {
    return studentTransactions;
}

export function getStudentStats() {
    const totalOrders = studentTransactions.length;
    const totalSpent = studentTransactions.reduce((sum, t) => sum + t.totalPrice, 0);

    const now = new Date();
    const thisMonth = studentTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = studentTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    });

    const thisMonthOrders = thisMonth.length;
    const thisMonthSpent = thisMonth.reduce((sum, t) => sum + t.totalPrice, 0);
    const lastMonthOrders = lastMonth.length;
    const lastMonthSpent = lastMonth.reduce((sum, t) => sum + t.totalPrice, 0);

    // Monthly spend for last 6 months
    const monthlySpend = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthTxns = studentTransactions.filter((t) => {
            const td = new Date(t.date);
            return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
        });
        monthlySpend.push({
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            fullLabel: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            orders: monthTxns.length,
            spent: monthTxns.reduce((sum, t) => sum + t.totalPrice, 0),
        });
    }

    // Favorite item (most ordered)
    const itemCounts = {};
    studentTransactions.forEach((t) => {
        t.items.forEach((item) => {
            itemCounts[item.id] = itemCounts[item.id] || { ...item, totalQty: 0 };
            itemCounts[item.id].totalQty += item.quantity;
        });
    });
    const favoriteItem = Object.values(itemCounts).sort((a, b) => b.totalQty - a.totalQty)[0] || null;

    return {
        totalOrders,
        totalSpent,
        thisMonthOrders,
        thisMonthSpent,
        lastMonthOrders,
        lastMonthSpent,
        monthlySpend,
        favoriteItem,
        memberSince: new Date(now.getFullYear(), now.getMonth() - 5, 15).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        }),
    };
}

// Export all revenue data as CSV string
export function exportToCSV() {
    const headers = ['Date', 'Day', 'Revenue (₹)', 'Orders', 'Avg Order Value (₹)'];
    const rows = dailyRevenue.map((d) => [d.date, d.dayName, d.revenue, d.orders, d.avgOrderValue]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
}

// Generate printable HTML report
export function generatePrintReport() {
    const comparative = getComparativeData();
    const today = getTodayStats();
    const week = getThisWeekStats();
    const month = getThisMonthStats();

    return `
        <html>
        <head>
            <title>Chai Adda - Revenue Report</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                h1 { color: #E8652B; margin-bottom: 5px; }
                .subtitle { color: #888; margin-bottom: 30px; }
                .kpi-row { display: flex; gap: 20px; margin-bottom: 30px; }
                .kpi { flex: 1; background: #f8f4f0; border-radius: 12px; padding: 20px; text-align: center; border-top: 3px solid #E8652B; }
                .kpi-value { font-size: 28px; font-weight: 800; color: #E8652B; }
                .kpi-label { font-size: 12px; color: #888; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #E8652B; color: white; padding: 10px; text-align: left; }
                td { padding: 8px 10px; border-bottom: 1px solid #eee; }
                tr:nth-child(even) { background: #faf8f6; }
                .section-title { font-size: 18px; font-weight: 700; margin-top: 30px; color: #2D1810; }
                .comparison { display: flex; gap: 20px; margin-top: 15px; }
                .compare-card { flex: 1; background: #f8f4f0; border-radius: 12px; padding: 20px; }
                .compare-card h3 { margin-bottom: 10px; font-size: 14px; color: #888; }
                .compare-value { font-size: 22px; font-weight: 700; }
                .positive { color: #22c55e; }
                .negative { color: #ef4444; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #aaa; text-align: center; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <h1>☕ Chai Adda Revenue Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div class="kpi-row">
                <div class="kpi">
                    <div class="kpi-value">₹${today.revenue.toLocaleString()}</div>
                    <div class="kpi-label">Today's Revenue</div>
                </div>
                <div class="kpi">
                    <div class="kpi-value">₹${week.revenue.toLocaleString()}</div>
                    <div class="kpi-label">This Week</div>
                </div>
                <div class="kpi">
                    <div class="kpi-value">₹${month.revenue.toLocaleString()}</div>
                    <div class="kpi-label">This Month</div>
                </div>
            </div>

            <p class="section-title">Month Comparison</p>
            <div class="comparison">
                <div class="compare-card">
                    <h3>${comparative.thisMonth.label}</h3>
                    <div class="compare-value">₹${comparative.thisMonth.revenue.toLocaleString()}</div>
                    <p>${comparative.thisMonth.orders} orders · Avg ₹${comparative.thisMonth.avgOrderValue}</p>
                </div>
                <div class="compare-card">
                    <h3>${comparative.lastMonth.label}</h3>
                    <div class="compare-value">₹${comparative.lastMonth.revenue.toLocaleString()}</div>
                    <p>${comparative.lastMonth.orders} orders · Avg ₹${comparative.lastMonth.avgOrderValue}</p>
                </div>
            </div>
            <p style="margin-top:10px;">Revenue change: <span class="${comparative.changes.revenue >= 0 ? 'positive' : 'negative'}">${comparative.changes.revenue >= 0 ? '▲' : '▼'} ${Math.abs(comparative.changes.revenue)}%</span></p>

            <p class="section-title">Top Items This Month</p>
            <table>
                <tr><th>Item</th><th>Units Sold</th><th>Revenue</th></tr>
                ${comparative.topItems.map((item) => `<tr><td>${item.emoji} ${item.name}</td><td>${item.sold}</td><td>₹${item.revenue.toLocaleString()}</td></tr>`).join('')}
            </table>

            <p class="section-title">Daily Revenue (Last 30 Days)</p>
            <table>
                <tr><th>Date</th><th>Day</th><th>Revenue</th><th>Orders</th><th>Avg Value</th></tr>
                ${getDailyRevenue(30).map((d) => `<tr><td>${d.date}</td><td>${d.dayName}</td><td>₹${d.revenue.toLocaleString()}</td><td>${d.orders}</td><td>₹${d.avgOrderValue}</td></tr>`).join('')}
            </table>

            <div class="footer">
                <p>Chai Adda · Owner Dashboard Report · Confidential</p>
            </div>
        </body>
        </html>
    `;
}
