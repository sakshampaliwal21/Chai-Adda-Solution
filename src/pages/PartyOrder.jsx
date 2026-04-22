import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { menuData, categories } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './PartyOrder.css';

const TIME_SLOTS = [
    '10:00 AM – 11:00 AM',
    '11:00 AM – 12:00 PM',
    '12:00 PM – 1:00 PM',
    '1:00 PM – 2:00 PM',
    '2:00 PM – 3:00 PM',
    '3:00 PM – 4:00 PM',
    '4:00 PM – 5:00 PM',
    '5:00 PM – 6:00 PM',
    '6:00 PM – 7:00 PM',
    '7:00 PM – 8:00 PM',
    '8:00 PM – 9:00 PM',
    '9:00 PM – 10:00 PM',
    '10:00 PM – 11:00 PM',
];

function getDateOptions() {
    const today = new Date();
    const options = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
        options.push({
            value: d.toISOString().split('T')[0],
            label,
            dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        });
    }
    return options;
}

export default function PartyOrder() {
    const navigate = useNavigate();
    const { addItem, removeItem, updateQuantity, items, totalPrice, totalItems, setScheduleInfo, clearCart } = useCart();
    const { addToast } = useToast();

    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({});

    const dateOptions = useMemo(() => getDateOptions(), []);

    const getItemQty = (itemId) => {
        const found = items.find((i) => i.id === itemId);
        return found ? found.quantity : 0;
    };

    const handleAdd = (item) => {
        addItem(item);
    };

    const handleQtyChange = (itemId, delta) => {
        const current = getItemQty(itemId);
        const next = current + delta;
        if (next <= 0) {
            removeItem(itemId);
        } else {
            updateQuantity(itemId, next);
        }
    };

    const validate = () => {
        const errs = {};
        if (items.length === 0) errs.items = 'Add at least one item';
        if (!selectedDate) errs.date = 'Select a date';
        if (!selectedSlot) errs.slot = 'Select a time slot';
        if (!name.trim()) errs.name = 'Enter your name';
        if (!phone.trim() || phone.trim().length < 10) errs.phone = 'Enter a valid phone number';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) {
            addToast('Please fill in all required fields', 'error');
            return;
        }

        setScheduleInfo({
            date: selectedDate,
            timeSlot: selectedSlot,
            name: name.trim(),
            phone: phone.trim(),
            isPartyOrder: true,
        });

        addToast('Party order scheduled! Proceeding to payment...', 'success');
        navigate('/payment');
    };

    return (
        <div className="party-page page-enter">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="party-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="party-header-text">
                        <h1>🎉 Party & Bulk Orders</h1>
                        <p>Plan ahead — pick items, choose a date & time, and we'll have it ready!</p>
                    </div>
                    <div className="party-header-badge glass">
                        <span className="badge-icon">📦</span>
                        <div>
                            <span className="badge-num">{totalItems}</span>
                            <span className="badge-label">items added</span>
                        </div>
                    </div>
                </motion.div>

                <div className="party-layout">
                    {/* Left — Menu Browser */}
                    <motion.div
                        className="party-menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Category Tabs */}
                        <div className="party-categories">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`party-cat-btn cursor-target ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    <span>{menuData[cat].emoji}</span>
                                    <span>{menuData[cat].label.replace(/^[^\s]+\s/, '')}</span>
                                </button>
                            ))}
                        </div>

                        {/* Items Grid */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                className="party-items-grid"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {menuData[activeCategory].items.map((item) => {
                                    const qty = getItemQty(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className={`party-item-card glass ${qty > 0 ? 'has-qty' : ''}`}
                                        >
                                            <div className="party-item-top">
                                                {item.image ? (
                                                    <img className="party-item-img" src={item.image} alt={item.name} loading="lazy" />
                                                ) : (
                                                    <span className="party-item-emoji">{item.emoji}</span>
                                                )}
                                                <div className="party-item-info">
                                                    <h4>{item.name}</h4>
                                                    <span className="party-item-price">₹{item.price}{item.size ? ` · ${item.size}` : ''}</span>
                                                </div>
                                            </div>
                                            <div className="party-item-controls">
                                                {qty === 0 ? (
                                                    <button
                                                        className="btn btn-primary btn-sm party-add-btn cursor-target"
                                                        onClick={() => handleAdd(item)}
                                                    >
                                                        + Add
                                                    </button>
                                                ) : (
                                                    <div className="party-qty-controls">
                                                        <button
                                                            className="qty-btn"
                                                            onClick={() => handleQtyChange(item.id, -1)}
                                                        >
                                                            −
                                                        </button>
                                                        <motion.span
                                                            className="qty-display"
                                                            key={qty}
                                                            initial={{ scale: 1.4 }}
                                                            animate={{ scale: 1 }}
                                                        >
                                                            {qty}
                                                        </motion.span>
                                                        <button
                                                            className="qty-btn"
                                                            onClick={() => handleQtyChange(item.id, 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Right — Scheduling Panel */}
                    <motion.div
                        className="party-schedule glass-strong"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2>📅 Schedule Pickup</h2>

                        {/* Date Selector */}
                        <div className="schedule-section">
                            <label className="schedule-label">Select Date</label>
                            <div className="date-options">
                                {dateOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        className={`date-card cursor-target ${selectedDate === opt.value ? 'active' : ''}`}
                                        onClick={() => setSelectedDate(opt.value)}
                                    >
                                        <span className="date-day">{opt.label}</span>
                                        <span className="date-str">{opt.dateStr}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.date && <span className="field-error">{errors.date}</span>}
                        </div>

                        {/* Time Slot Selector */}
                        <div className="schedule-section">
                            <label className="schedule-label">Select Time Slot</label>
                            <div className="time-slots">
                                {TIME_SLOTS.map((slot) => (
                                    <button
                                        key={slot}
                                        className={`slot-btn cursor-target ${selectedSlot === slot ? 'active' : ''}`}
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                            {errors.slot && <span className="field-error">{errors.slot}</span>}
                        </div>

                        {/* Contact Info */}
                        <div className="schedule-section">
                            <label className="schedule-label">Contact Details</label>
                            <div className="contact-fields">
                                <div className="field-group">
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`party-input ${errors.name ? 'input-error' : ''}`}
                                    />
                                    {errors.name && <span className="field-error">{errors.name}</span>}
                                </div>
                                <div className="field-group">
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={`party-input ${errors.phone ? 'input-error' : ''}`}
                                        maxLength={10}
                                    />
                                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="schedule-section">
                            <label className="schedule-label">Order Summary</label>
                            {items.length === 0 ? (
                                <p className="empty-summary">No items added yet</p>
                            ) : (
                                <div className="party-summary-items">
                                    {items.map((item) => (
                                        <div key={item.id} className="party-summary-row">
                                            <span>{item.emoji} {item.name}</span>
                                            <span className="summary-qty">×{item.quantity} — ₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.items && <span className="field-error">{errors.items}</span>}
                        </div>

                        {/* Total & CTA */}
                        <div className="party-total-section">
                            <div className="party-total-row">
                                <span>Total</span>
                                <span className="party-total-price">₹{totalPrice}</span>
                            </div>
                            <button
                                className="btn btn-primary btn-lg party-submit-btn cursor-target"
                                onClick={handleSubmit}
                            >
                                Schedule Order →
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
