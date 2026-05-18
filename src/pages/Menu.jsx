import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { menuData, categories } from '../data/menuData';
import SpotlightCard from '../components/SpotlightCard';
import './Menu.css';

export default function Menu() {
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const { addItem, updateQuantity, items: cartItems } = useCart();
    const { addToast } = useToast();
    const { isInStock, getStock } = useStock();
    const { isAuthenticated, user, toggleFavoriteItem } = useAuth();

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
        if (!isInStock(item.id)) {
            addToast(`${item.name} is out of stock!`, 'error');
            return;
        }
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
                                        const outOfStock = !isInStock(item.id);
                                        const stockQty = getStock(item.id);
                                        return (
                                            <motion.div
                                                key={item.id}
                                                className="menu-card-motion-wrapper"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                                whileHover={{ y: outOfStock ? 0 : -4 }}
                                                layout
                                                style={{ position: 'relative', height: '100%' }}
                                            >
                                                <SpotlightCard className={`menu-card cursor-target ${outOfStock ? 'out-of-stock' : ''}`} spotlightColor="rgba(232, 101, 43, 0.2)">
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
                                                    <div className="card-image-bg">
                                                    {item.image ? (
                                                    <img src={item.image} alt={item.name} loading="lazy" />
                                                ) : (
                                                    <span className="card-emoji-fallback">{item.emoji}</span>
                                                )}
                                                {outOfStock && (
                                                    <div className="oos-overlay">
                                                        <span className="oos-badge">Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>
                                                <div className="card-content">
                                                    <h3 className="card-name">{item.name}</h3>
                                                    {item.size && (
                                                        <span className="card-size">{item.size}</span>
                                                    )}
                                                    {!outOfStock && stockQty <= 5 && (
                                                        <span className="card-low-stock">Only {stockQty} left!</span>
                                                    )}
                                                    <div className="card-bottom">
                                                        <span className="card-price">₹{item.price}</span>
                                                        {outOfStock ? (
                                                            <button className="add-btn disabled" disabled>
                                                                <span>Unavailable</span>
                                                            </button>
                                                        ) : qty > 0 ? (
                                                            <div className="qty-controls">
                                                                <button 
                                                                    className="qty-btn minus"
                                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, qty - 1); }}
                                                                >-</button>
                                                                <span className="qty-display">{qty}</span>
                                                                <button 
                                                                    className="qty-btn plus"
                                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, qty + 1); }}
                                                                >+</button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="add-btn"
                                                                onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                                                            >
                                                                <span>Add +</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                </SpotlightCard>
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

