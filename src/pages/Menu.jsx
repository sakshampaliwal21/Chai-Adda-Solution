import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { menuData, categories } from '../data/menuData';
import './Menu.css';

export default function Menu() {
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const { addItem, items: cartItems } = useCart();
    const { addToast } = useToast();

    const currentItems = useMemo(() => {
        const items = menuData[activeCategory]?.items || [];
        if (!searchQuery.trim()) return items;
        return items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activeCategory, searchQuery]);

    const getCartQuantity = (id) => {
        const item = cartItems.find((i) => i.id === id);
        return item ? item.quantity : 0;
    };

    const handleAddToCart = (item) => {
        addItem(item);
        addToast(`${item.name} added to cart!`, 'success');
    };

    return (
        <div className="menu-page page-enter">
            <div className="container">
                {/* Header */}
                <motion.div
                    className="menu-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="menu-header-text">
                        <h1>Our Menu</h1>
                        <p>Fresh, fast, and full of flavor — straight from Chai Adda</p>
                    </div>
                    <div className="menu-search">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    className="category-tabs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`category-tab cursor-target ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(cat);
                                setSearchQuery('');
                            }}
                        >
                            <span className="tab-emoji">{menuData[cat].emoji}</span>
                            <span className="tab-label">{menuData[cat].label.replace(/^.+\s/, '')}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Items Grid */}
                <div className="menu-grid">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            className="items-container"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentItems.length === 0 ? (
                                <div className="no-results">
                                    <span className="no-results-emoji">🔍</span>
                                    <p>No items found</p>
                                </div>
                            ) : (
                                <div className="items-grid">
                                    {currentItems.map((item, index) => {
                                        const qty = getCartQuantity(item.id);
                                        return (
                                            <motion.div
                                                key={item.id}
                                                className="menu-card cursor-target"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                                whileHover={{ y: -4 }}
                                                layout
                                            >
                                                <div className="card-image-bg">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} loading="lazy" />
                                                ) : (
                                                    <span className="card-emoji-fallback">{item.emoji}</span>
                                                )}
                                            </div>
                                                <div className="card-content">
                                                    <h3 className="card-name">{item.name}</h3>
                                                    {item.size && (
                                                        <span className="card-size">{item.size}</span>
                                                    )}
                                                    <div className="card-bottom">
                                                        <span className="card-price">₹{item.price}</span>
                                                        <button
                                                            className={`add-btn ${qty > 0 ? 'added' : ''}`}
                                                            onClick={() => handleAddToCart(item)}
                                                        >
                                                            {qty > 0 ? (
                                                                <span className="add-btn-qty">{qty} ✓</span>
                                                            ) : (
                                                                <span>Add +</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
