import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStock } from '../context/StockContext';
import { useToast } from '../context/ToastContext';
import { menuData, categories } from '../data/menuData';
import './StockManagement.css';

export default function StockManagement() {
    const {
        stock,
        getStock,
        updateStock,
        incrementStock,
        decrementStock,
        resetAllStock,
        outOfStockItems,
        lowStockItems,
    } = useStock();
    const { addToast } = useToast();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    // Flatten all items with their category info
    const allItems = useMemo(() => {
        const items = [];
        categories.forEach((catKey) => {
            const cat = menuData[catKey];
            cat.items.forEach((item) => {
                items.push({ ...item, category: catKey, categoryLabel: cat.label, categoryEmoji: cat.emoji });
            });
        });
        return items;
    }, []);

    // Filter items
    const filteredItems = useMemo(() => {
        let items = allItems;
        if (activeCategory !== 'all') {
            items = items.filter((i) => i.category === activeCategory);
        }
        if (searchQuery.trim()) {
            items = items.filter((i) =>
                i.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return items;
    }, [allItems, activeCategory, searchQuery]);

    const handleStartEdit = (itemId) => {
        setEditingItem(itemId);
        setEditValue(String(getStock(itemId)));
    };

    const handleSaveEdit = (itemId) => {
        const val = parseInt(editValue, 10);
        if (!isNaN(val) && val >= 0) {
            updateStock(itemId, val);
            addToast('Stock updated successfully', 'success');
        } else {
            addToast('Invalid stock value', 'error');
        }
        setEditingItem(null);
        setEditValue('');
    };

    const handleKeyDown = (e, itemId) => {
        if (e.key === 'Enter') handleSaveEdit(itemId);
        if (e.key === 'Escape') {
            setEditingItem(null);
            setEditValue('');
        }
    };

    const handleIncrement = (itemId, amount = 1) => {
        incrementStock(itemId, amount);
    };

    const handleDecrement = (itemId, amount = 1) => {
        decrementStock(itemId, amount);
    };

    const handleMarkOutOfStock = (itemId) => {
        updateStock(itemId, 0);
        addToast('Item marked as out of stock', 'warning');
    };

    const handleResetAll = () => {
        resetAllStock();
        addToast('All stock levels reset to default', 'info');
        setShowConfirmReset(false);
    };

    const getStockStatus = (qty) => {
        if (qty === 0) return { label: 'Out of Stock', className: 'stock-out', icon: '🔴' };
        if (qty <= 5) return { label: 'Low Stock', className: 'stock-low', icon: '🟡' };
        if (qty <= 15) return { label: 'Medium', className: 'stock-medium', icon: '🟠' };
        return { label: 'In Stock', className: 'stock-good', icon: '🟢' };
    };

    // Stats
    const totalItems = allItems.length;
    const inStockCount = totalItems - outOfStockItems.length;

    return (
        <div className="stock-management">
            {/* Header */}
            <motion.div
                className="stock-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="stock-header-text">
                    <h2>📦 Stock Management</h2>
                    <p>Track and manage inventory for all menu items</p>
                </div>
            </motion.div>

            {/* Summary Stats */}
            <motion.div
                className="stock-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <div className="stock-stat-card glass">
                    <span className="stock-stat-icon"></span>
                    <div className="stock-stat-data">
                        <span className="stock-stat-num">{totalItems}</span>
                        <span className="stock-stat-lbl">Total Items</span>
                    </div>
                </div>
                <div className="stock-stat-card glass stock-stat-good">
                    <span className="stock-stat-icon"></span>
                    <div className="stock-stat-data">
                        <span className="stock-stat-num">{inStockCount}</span>
                        <span className="stock-stat-lbl">In Stock</span>
                    </div>
                </div>
                <div className="stock-stat-card glass stock-stat-warning">
                    <span className="stock-stat-icon"></span>
                    <div className="stock-stat-data">
                        <span className="stock-stat-num">{lowStockItems.length}</span>
                        <span className="stock-stat-lbl">Low Stock</span>
                    </div>
                </div>
                <div className="stock-stat-card glass stock-stat-danger">
                    <span className="stock-stat-icon"></span>
                    <div className="stock-stat-data">
                        <span className="stock-stat-num">{outOfStockItems.length}</span>
                        <span className="stock-stat-lbl">Out of Stock</span>
                    </div>
                </div>
            </motion.div>

            {/* Search & Actions Bar */}
            <motion.div
                className="stock-toolbar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="stock-search">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-ghost btn-sm stock-reset-btn"
                    onClick={() => setShowConfirmReset(true)}
                >
                    Reset All Stock
                </button>
            </motion.div>

            {/* Category Filter */}
            <motion.div
                className="stock-categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <button
                    className={`stock-cat-btn cursor-target ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                >
                    All
                </button>
                {categories.map((catKey) => (
                    <button
                        key={catKey}
                        className={`stock-cat-btn cursor-target ${activeCategory === catKey ? 'active' : ''}`}
                        onClick={() => setActiveCategory(catKey)}
                    >
                        {menuData[catKey].emoji} {menuData[catKey].label.replace(/^.+\s/, '')}
                    </button>
                ))}
            </motion.div>

            {/* Stock Items List */}
            <div className="stock-items-list">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory + searchQuery}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {filteredItems.length === 0 ? (
                            <div className="stock-no-results">
                                <span>🔍</span>
                                <p>No items found</p>
                            </div>
                        ) : (
                            <div className="stock-table">
                                <div className="stock-table-header">
                                    <span className="stock-col-item">Item</span>
                                    <span className="stock-col-category">Category</span>
                                    <span className="stock-col-price">Price</span>
                                    <span className="stock-col-status">Status</span>
                                    <span className="stock-col-qty">Quantity</span>
                                    <span className="stock-col-actions">Actions</span>
                                </div>
                                {filteredItems.map((item, index) => {
                                    const qty = getStock(item.id);
                                    const status = getStockStatus(qty);
                                    return (
                                        <motion.div
                                            key={item.id}
                                            className={`stock-table-row ${status.className}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                        >
                                            <div className="stock-col-item">
                                                <span className="stock-item-emoji">{item.emoji}</span>
                                                <div className="stock-item-info">
                                                    <span className="stock-item-name">{item.name}</span>
                                                    {item.size && (
                                                        <span className="stock-item-size">{item.size}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="stock-col-category">
                                                <span className="stock-cat-badge">
                                                    {item.categoryEmoji}
                                                </span>
                                            </div>
                                            <div className="stock-col-price">₹{item.price}</div>
                                            <div className="stock-col-status">
                                                <span className={`stock-status-badge ${status.className}`}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </div>
                                            <div className="stock-col-qty">
                                                <div className="stock-qty-controls">
                                                    <button
                                                        className="stock-qty-btn minus"
                                                        onClick={() => handleDecrement(item.id)}
                                                        disabled={qty === 0}
                                                    >
                                                        −
                                                    </button>
                                                    {editingItem === item.id ? (
                                                        <input
                                                            type="number"
                                                            className="stock-qty-input"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={() => handleSaveEdit(item.id)}
                                                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                                                            autoFocus
                                                            min="0"
                                                        />
                                                    ) : (
                                                        <span
                                                            className="stock-qty-value"
                                                            onClick={() => handleStartEdit(item.id)}
                                                            title="Click to edit"
                                                        >
                                                            {qty}
                                                        </span>
                                                    )}
                                                    <button
                                                        className="stock-qty-btn plus"
                                                        onClick={() => handleIncrement(item.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="stock-col-actions">
                                                <button
                                                    className="stock-action-btn restock"
                                                    onClick={() => handleIncrement(item.id, 10)}
                                                    title="Add 10 units"
                                                >
                                                    +10
                                                </button>
                                                {qty > 0 ? (
                                                    <button
                                                        className="stock-action-btn mark-oos"
                                                        onClick={() => handleMarkOutOfStock(item.id)}
                                                        title="Mark as out of stock"
                                                    >
                                                        ✕
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="stock-action-btn restock-full"
                                                        onClick={() => updateStock(item.id, 50)}
                                                        title="Restock to 50"
                                                    >
                                                        🔄
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showConfirmReset && (
                    <motion.div
                        className="stock-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowConfirmReset(false)}
                    >
                        <motion.div
                            className="stock-modal glass-strong"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="stock-modal-icon"></span>
                            <h3>Reset All Stock?</h3>
                            <p>This will reset all items to 50 units. This action cannot be undone.</p>
                            <div className="stock-modal-actions">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setShowConfirmReset(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleResetAll}
                                >
                                    Reset All
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
